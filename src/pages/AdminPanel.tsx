import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Users, Settings, Trash2, Edit, Plus, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  role: string;
  subscription?: {
    type: string;
    expiresAt: string;
    isActive: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  files: Array<{
    id: string;
    filename: string;
    size: string;
    uploadedAt: string;
  }>;
}

export default function AdminPanel() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newSubscription, setNewSubscription] = useState({ type: '7days', days: 7 });
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'SPOOFER4YOU',
    siteIcon: '',
    headerImage: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // API base URL - automatically detects environment
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : `${window.location.protocol}//${window.location.host}/api`;

  useEffect(() => {
    fetchUsers();
    fetchCategories();
    fetchSiteSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch site settings');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedCategory) {
      toast.error('Please select a file and category');
      return;
    }

    const allowedExtensions = ['.zip', '.rar', '.exe', '.dll', '.data', '.7z'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Only .zip, .rar, .exe, .dll, .data, .7z files are allowed');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('categoryId', selectedCategory);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('File uploaded successfully');
        setSelectedFile(null);
        fetchCategories();
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Category created');
        setNewCategoryName('');
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to create category');
      }
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const updateUserSubscription = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users/${editingUser.id}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSubscription)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Subscription updated');
        setEditingUser(null);
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to update subscription');
      }
    } catch (error) {
      toast.error('Error updating subscription');
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('File deleted');
        fetchCategories();
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
    }
  };

  const updateSiteSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(siteSettings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Settings updated');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Error updating settings');
    }
  };

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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard'}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
              {siteSettings.siteName}
            </Badge>
          </div>
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
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-purple-500/20">
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-500/20">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/20">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-purple-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Upload Files</CardTitle>
                <CardDescription className="text-gray-300">
                  Upload .zip, .rar, .exe, .dll, .data, .7z files to categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-200">Select Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-black/50 border-purple-500/30 text-white">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-purple-500/30">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-gray-200">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".zip,.rar,.exe,.dll,.data,.7z"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-400">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleFileUpload}
                  disabled={!selectedFile || !selectedCategory || isUploading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </CardContent>
            </Card>

            {/* Files List */}
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      {category.name}
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {category.files.length} files
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.files.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No files in this category</p>
                    ) : (
                      <div className="space-y-2">
                        {category.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div>
                              <p className="text-white font-medium">{file.filename}</p>
                              <p className="text-gray-400 text-sm">Size: {file.size} • Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage user subscriptions and access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          {user.subscription ? (
                            <Badge variant={user.subscription.isActive ? 'default' : 'destructive'}>
                              {user.subscription.type} - {user.subscription.isActive ? 'Active' : 'Expired'}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">No Subscription</Badge>
                          )}
                        </div>
                      </div>
                      {user.role !== 'admin' && (
                        <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingUser(user);
                                setIsDialogOpen(true);
                              }}
                              className="border-purple-500/50 text-purple-300"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black border-purple-500/30">
                            <DialogHeader>
                              <DialogTitle className="text-white">Edit Subscription - {user.username}</DialogTitle>
                              <DialogDescription className="text-gray-300">
                                Update user subscription settings
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-gray-200">Subscription Type</Label>
                                <Select 
                                  value={newSubscription.type} 
                                  onValueChange={(value) => {
                                    const days = {
                                      '7days': 7,
                                      '30days': 30,
                                      '60days': 60,
                                      '365days': 365
                                    };
                                    setNewSubscription({ 
                                      type: value as '7days' | '30days' | '60days' | '365days', 
                                      days: days[value as keyof typeof days] 
                                    });
                                  }}
                                >
                                  <SelectTrigger className="bg-black/50 border-purple-500/30 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-purple-500/30">
                                    <SelectItem value="7days">7 Days</SelectItem>
                                    <SelectItem value="30days">30 Days</SelectItem>
                                    <SelectItem value="60days">60 Days</SelectItem>
                                    <SelectItem value="365days">365 Days</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button 
                                onClick={updateUserSubscription}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                              >
                                Update Subscription
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Category Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Create and manage download categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter category name (e.g., SPOOFER4YOU)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-black/50 border-purple-500/30 text-white flex-1"
                  />
                  <Button 
                    onClick={createCategory}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <span className="text-white font-medium">{category.name}</span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {category.files.length} files
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Site Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Customize site appearance and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-gray-200">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteIcon" className="text-gray-200">Site Icon URL (PNG/JPEG)</Label>
                  <Input
                    id="siteIcon"
                    placeholder="/images/SiteIcon.jpg"
                    value={siteSettings.siteIcon}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, siteIcon: e.target.value }))}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerImage" className="text-gray-200">Header Image URL (PNG/JPEG)</Label>
                  <Input
                    id="headerImage"
                    placeholder="/images/HeaderImage.jpg"
                    value={siteSettings.headerImage}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, headerImage: e.target.value }))}
                    className="bg-black/50 border-purple-500/30 text-white"
                  />
                </div>
                <Button 
                  onClick={updateSiteSettings}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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