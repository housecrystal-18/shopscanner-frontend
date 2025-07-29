import React, { useState } from 'react';
import { 
  Send, 
  User, 
  Mail, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Loader,
  Bug,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ContactFormData {
  name: string;
  email: string;
  category: 'bug' | 'feature' | 'support' | 'billing' | 'other';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const CATEGORIES = [
  { value: 'support', label: 'General Support', icon: HelpCircle, color: 'blue' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'yellow' },
  { value: 'billing', label: 'Billing Issue', icon: AlertCircle, color: 'orange' },
  { value: 'other', label: 'Other', icon: MessageSquare, color: 'gray' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low', description: 'General inquiry, no rush' },
  { value: 'medium', label: 'Medium', description: 'Normal priority' },
  { value: 'high', label: 'High', description: 'Important issue' },
  { value: 'urgent', label: 'Urgent', description: 'Blocking issue, needs immediate attention' }
];

export function ContactForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: user?.name || '',
    email: user?.email || '',
    category: 'support',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 100) {
      newErrors.subject = 'Subject must be less than 100 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/api/support/contact', {
        ...formData,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      setIsSubmitted(true);
      toast.success('Support request submitted successfully!');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Submitted Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We've received your {formData.category} request 
            and will get back to you within 24 hours.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ticket ID:</span>
              <span className="font-mono text-gray-900">
                {`SS-${Date.now().toString().slice(-6)}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({
                name: user?.name || '',
                email: user?.email || '',
                category: 'support',
                subject: '',
                message: '',
                priority: 'medium'
              });
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-50 border-b border-primary-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Support</h2>
          <p className="text-gray-600">
            Need help? Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    formData.category === category.value
                      ? `border-${category.color}-300 bg-${category.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <category.icon className={`h-5 w-5 ${
                      formData.category === category.value
                        ? `text-${category.color}-600`
                        : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.category === category.value
                        ? `text-${category.color}-900`
                        : 'text-gray-700'
                    }`}>
                      {category.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    formData.priority === priority.value
                      ? getPriorityColor(priority.value)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{priority.label}</div>
                  <div className="text-sm opacity-75">{priority.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.subject ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Brief description of your issue"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.subject ? (
                <p className="text-sm text-red-600">{errors.subject}</p>
              ) : (
                <div />
              )}
              <p className="text-xs text-gray-500">{formData.subject.length}/100</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.message ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Please provide as much detail as possible about your issue..."
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message ? (
                <p className="text-sm text-red-600">{errors.message}</p>
              ) : (
                <div />
              )}
              <p className="text-xs text-gray-500">{formData.message.length}/2000</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}