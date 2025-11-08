'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Plus, Edit, Trash2, Download, Filter, Image, File, Video } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  mimeType?: string;
  fileSize?: number;
  entityType?: string;
  entityId?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: string;
}

export default function FilesPage() {
  const user = useUser({ or: 'redirect' });
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');

  const [fileForm, setFileForm] = useState({
    fileName: '',
    fileUrl: '',
    fileType: '',
    description: '',
    entityType: '',
    entityId: '',
  });

  useEffect(() => {
    fetchWedding();
  }, []);

  useEffect(() => {
    if (weddingId) {
      fetchFiles();
    }
  }, [weddingId, fileTypeFilter, entityTypeFilter]);

  async function fetchWedding() {
    try {
      const res = await fetch('/api/weddings');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setWeddingId(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching wedding:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFiles() {
    if (!weddingId) return;
    setLoading(true);
    try {
      let url = `/api/files?weddingId=${weddingId}`;
      if (fileTypeFilter !== 'all') {
        url += `&fileType=${fileTypeFilter}`;
      }
      if (entityTypeFilter !== 'all') {
        url += `&entityType=${entityTypeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }

  function openDialog(file?: MediaFile) {
    if (file) {
      setSelectedFile(file);
      setFileForm({
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: file.fileType || '',
        description: file.description || '',
        entityType: file.entityType || '',
        entityId: file.entityId || '',
      });
    } else {
      setSelectedFile(null);
      setFileForm({
        fileName: '',
        fileUrl: '',
        fileType: '',
        description: '',
        entityType: '',
        entityId: '',
      });
    }
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setSelectedFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !fileForm.fileName || !fileForm.fileUrl) return;

    try {
      const url = selectedFile ? `/api/files/${selectedFile.id}` : '/api/files';
      const method = selectedFile ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          fileName: fileForm.fileName,
          fileUrl: fileForm.fileUrl,
          fileType: fileForm.fileType || null,
          description: fileForm.description || null,
          entityType: fileForm.entityType || null,
          entityId: fileForm.entityId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchFiles();
        closeDialog();
      } else {
        alert(data.error || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        await fetchFiles();
      } else {
        alert(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  }

  function getFileIcon(fileType?: string) {
    if (!fileType) return <File className="h-5 w-5" />;
    if (fileType.startsWith('image')) return <Image className="h-5 w-5" />;
    if (fileType.startsWith('video')) return <Video className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function filterFiles(files: MediaFile[]) {
    return files.filter((file) => {
      if (fileTypeFilter !== 'all' && file.fileType !== fileTypeFilter) return false;
      if (entityTypeFilter !== 'all' && file.entityType !== entityTypeFilter) return false;
      return true;
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const filteredFiles = filterFiles(files);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Files & Documents</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Upload and organize documents, contracts, photos, and media files
                </p>
              </div>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add File
              </Button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="all">All Entities</option>
                  <option value="vendor">Vendors</option>
                  <option value="guest">Guests</option>
                  <option value="task">Tasks</option>
                  <option value="event">Events</option>
                </select>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No files found. Upload your first file to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFiles.map((file) => (
                  <Card key={file.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.fileType)}
                          <CardTitle className="text-lg">{file.fileName}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(file)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {file.description && (
                        <CardDescription className="mt-2">{file.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {file.fileType && (
                          <p className="text-gray-600 dark:text-gray-400">
                            Type: {file.fileType}
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400">
                          Size: {formatFileSize(file.fileSize)}
                        </p>
                        {file.entityType && (
                          <p className="text-gray-600 dark:text-gray-400">
                            Linked to: {file.entityType}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Uploaded: {formatDate(file.createdAt)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* File Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedFile ? 'Edit File' : 'Add New File'}
                  </DialogTitle>
                  <DialogDescription>
                    Add file metadata. Upload the file to your storage service and paste the URL here.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        File Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fileForm.fileName}
                        onChange={(e) =>
                          setFileForm({ ...fileForm, fileName: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="e.g., vendor-contract.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        File URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={fileForm.fileUrl}
                        onChange={(e) =>
                          setFileForm({ ...fileForm, fileUrl: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="https://..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload file to Vercel Blob, AWS S3, or similar service and paste URL here
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          File Type
                        </label>
                        <select
                          value={fileForm.fileType}
                          onChange={(e) =>
                            setFileForm({ ...fileForm, fileType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">Select type</option>
                          <option value="image">Image</option>
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Link to Entity Type
                        </label>
                        <select
                          value={fileForm.entityType}
                          onChange={(e) =>
                            setFileForm({ ...fileForm, entityType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">None</option>
                          <option value="vendor">Vendor</option>
                          <option value="guest">Guest</option>
                          <option value="task">Task</option>
                          <option value="event">Event</option>
                          <option value="wedding">Wedding</option>
                        </select>
                      </div>
                    </div>
                    {fileForm.entityType && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Entity ID
                        </label>
                        <input
                          type="text"
                          value={fileForm.entityId}
                          onChange={(e) =>
                            setFileForm({ ...fileForm, entityId: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                          placeholder="UUID of the linked entity"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={fileForm.description}
                        onChange={(e) =>
                          setFileForm({ ...fileForm, description: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="File description..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save File</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}

