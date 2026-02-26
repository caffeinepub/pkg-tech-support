import { useState } from 'react';
import { useGetLoginEvents, useGetLoginEventsCSV } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileSpreadsheet, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginTracking() {
  const { data: loginEvents = [], isLoading } = useGetLoginEvents();
  const { refetch: downloadCSV, isFetching: isDownloading } = useGetLoginEventsCSV();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadCSV = async () => {
    try {
      setDownloadError(null);
      const result = await downloadCSV();
      
      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `login-tracking-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Login tracking data downloaded successfully');
      } else {
        throw new Error('No data received');
      }
    } catch (error) {
      const errorMsg = 'Failed to download login tracking data';
      setDownloadError(errorMsg);
      toast.error(errorMsg);
      console.error('Download error:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.toLowerCase().includes('expert') || role.toLowerCase().includes('technician')) {
      return 'bg-purple-500 hover:bg-purple-600';
    }
    if (role.toLowerCase().includes('customer')) {
      return 'bg-teal-500 hover:bg-teal-600';
    }
    return 'bg-gray-500 hover:bg-gray-600';
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading login tracking data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-2 border-teal-200 dark:border-teal-800">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-b-2 border-teal-100 dark:border-teal-900">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Login Tracking Dashboard
            </CardTitle>
            <CardDescription className="text-base text-teal-700 dark:text-teal-300 mt-2">
              Monitor and export user login activity
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Logins</p>
              <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{loginEvents.length}</p>
            </div>
            <Button
              onClick={handleDownloadCSV}
              disabled={isDownloading || loginEvents.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {downloadError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg text-sm text-destructive">
            {downloadError}
          </div>
        )}

        {loginEvents.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">No Login Events Yet</p>
            <p className="text-sm text-muted-foreground">
              Login events will appear here once users start logging in
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] rounded-lg border-2 border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 z-10">
                <TableRow>
                  <TableHead className="font-bold text-gray-900 dark:text-gray-100">Name</TableHead>
                  <TableHead className="font-bold text-gray-900 dark:text-gray-100">Role</TableHead>
                  <TableHead className="font-bold text-gray-900 dark:text-gray-100">Email</TableHead>
                  <TableHead className="font-bold text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timestamp
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-900 dark:text-gray-100">Principal ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginEvents.map((event, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors"
                  >
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(event.role)} text-white shadow-sm`}>
                        {event.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{event.email}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground max-w-[200px] truncate" title={event.principalId}>
                      {event.principalId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Excel-Compatible CSV Export
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Download login tracking data as a CSV file for offline analysis in Excel, Google Sheets, or other spreadsheet applications.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
