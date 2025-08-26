import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DownloadCategory {
  id: string;
  name: string;
  files: Array<{
    id: string;
    filename: string;
    size: string;
    uploadedAt: string;
  }>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // API base URL - automatically detects environment
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : `${window.location.protocol}//${window.location.host}/api`;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    if (!user?.subscription?.isActive) {
      toast.error('Premium subscription required for downloads');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download started');
      } else {
        toast.error('Download failed');
      }
    } catch (error) {
      toast.error('Download error');
    }
  };

  const getSubscriptionStatus = () => {
    if (!user?.subscription) return { text: 'No Subscription', color: 'destructive' };
    if (!user.subscription.isActive) return { text: 'Expired', color: 'destructive' };
    
    const expiresAt = new Date(user.subscription.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      text: `${user.subscription.type} (${daysLeft} days left)`,
      color: daysLeft > 7 ? 'default' : daysLeft > 3 ? 'secondary' : 'destructive'
    };
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-purple-500/20 bg-black/20 backdrop-blur-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SPOOFER4YOU
            </h1>
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              Premium Tools
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="w-4 h-4" />
              <span>{user?.username}</span>
            </div>
            <Badge variant={subscriptionStatus.color as "default" | "secondary" | "destructive" | "outline"} className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{subscriptionStatus.text}</span>
            </Badge>
            {user?.role === 'admin' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/admin'}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                Admin Panel
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-purple-300">Loading...</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center justify-between">
                    {category.name}
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {category.files.length} files
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Premium spoofing tools and utilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {category.files.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No files available in this category
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {category.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/10">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{file.filename}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Size: {file.size}</span>
                              <span>Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownload(file.id, file.filename)}
                            disabled={!user?.subscription?.isActive}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}