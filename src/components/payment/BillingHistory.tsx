import { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Loader,
  CreditCard
} from 'lucide-react';
import { Invoice, formatStripePrice } from '../../lib/stripe';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string>('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/billing/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load billing history');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      setDownloadingId(invoiceId);
      const response = await api.get(`/api/billing/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingId('');
    }
  };

  const getInvoiceStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'open':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'void':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'uncollectible':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInvoiceStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'void':
        return 'bg-gray-100 text-gray-800';
      case 'uncollectible':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPeriod = (start: number, end: number) => {
    const startDate = new Date(start * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const endDate = new Date(end * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startDate} - ${endDate}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading billing history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Receipt className="h-6 w-6 text-gray-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
          <p className="text-sm text-gray-600">View and download your invoices</p>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Paid</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatStripePrice(
                  invoices
                    .filter(inv => inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.amount_paid, 0)
                )}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-green-900">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {invoices.filter(inv => inv.status === 'open').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Billing History</h4>
          <p className="text-gray-600">
            Your invoices and billing history will appear here once you start a subscription.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getInvoiceStatusIcon(invoice.status)}
                  <div className="ml-3">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">
                        Invoice #{invoice.id.slice(-8).toUpperCase()}
                      </h4>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full capitalize ${getInvoiceStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="mr-4">{formatDate(invoice.created)}</span>
                      <span>Period: {formatPeriod(invoice.period_start, invoice.period_end)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatStripePrice(invoice.amount_paid || invoice.amount_due)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.currency.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}

                    {invoice.invoice_pdf && (
                      <button
                        onClick={() => downloadInvoice(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {downloadingId === invoice.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Open in Stripe"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              {invoice.status === 'open' && invoice.amount_due > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Payment required: {formatStripePrice(invoice.amount_due)}
                      </span>
                    </div>
                    <a
                      href={invoice.hosted_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-sm bg-yellow-600 text-white hover:bg-yellow-700 inline-flex items-center"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Pay Now
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Billing Info */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Billing Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Invoices are generated automatically for your subscription</p>
          <p>• You'll receive email notifications for upcoming and failed payments</p>
          <p>• Download PDFs for your records and expense reporting</p>
          <p>• Contact support if you have questions about any invoice</p>
        </div>
      </div>
    </div>
  );
}