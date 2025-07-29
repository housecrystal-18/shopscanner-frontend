import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageCircle,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface SupportTicket {
  id: string;
  subject: string;
  category: 'bug' | 'feature' | 'support' | 'billing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastResponse?: string;
  responseCount: number;
}

const STATUSES = [
  { value: 'open', label: 'Open', color: 'blue', icon: AlertCircle },
  { value: 'in_progress', label: 'In Progress', color: 'yellow', icon: Clock },
  { value: 'waiting_response', label: 'Waiting for Response', color: 'orange', icon: MessageCircle },
  { value: 'resolved', label: 'Resolved', color: 'green', icon: CheckCircle },
  { value: 'closed', label: 'Closed', color: 'gray', icon: CheckCircle }
];

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: 'red' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'low', label: 'Low', color: 'gray' }
];

export function SupportTickets() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority'>('updated');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', user?.id, statusFilter, sortBy],
    queryFn: async (): Promise<SupportTicket[]> => {
      const response = await api.get('/api/support/tickets', {
        params: {
          userId: user?.id,
          status: statusFilter || undefined,
          sortBy
        }
      });
      return response.data;
    },
    enabled: !!user?.id
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusInfo = (status: string) => {
    return STATUSES.find(s => s.value === status) || STATUSES[0];
  };

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[2];
  };

  const filteredTickets = tickets?.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return ticket.subject.toLowerCase().includes(query) ||
             ticket.id.toLowerCase().includes(query);
    }
    return true;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusInfo = getStatusInfo(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
        <statusInfo.icon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = getPriorityInfo(priority);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
        {priorityInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Ticket className="h-6 w-6 text-primary-600 mr-2" />
              Your Support Tickets
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage your support requests
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="priority">Priority</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="divide-y divide-gray-200">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tickets?.length === 0 ? 'No Support Tickets' : 'No tickets match your search'}
            </h3>
            <p className="text-gray-600">
              {tickets?.length === 0
                ? 'You haven\'t submitted any support requests yet.'
                : 'Try adjusting your search or filters.'
              }
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket.status);
            
            return (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Ticket Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg bg-${statusInfo.color}-100`}>
                        <statusInfo.icon className={`h-4 w-4 text-${statusInfo.color}-600`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {ticket.subject}
                          </h3>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-mono">#{ticket.id}</span>
                          <span className="capitalize">{ticket.category}</span>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Created {formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Status & Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(ticket.status)}
                        
                        {ticket.responseCount > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>{ticket.responseCount} responses</span>
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        Updated {formatDate(ticket.updatedAt)}
                      </div>
                    </div>

                    {/* Last Response Preview */}
                    {ticket.lastResponse && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {ticket.lastResponse}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={() => window.open(`/support/ticket/${ticket.id}`, '_blank')}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}