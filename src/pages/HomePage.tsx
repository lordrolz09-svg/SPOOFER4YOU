import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Star, Shield, Zap, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Advanced Spoofing",
      description: "State-of-the-art spoofing tools with military-grade encryption"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed and performance with real-time processing"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Professional-grade tools used by security experts worldwide"
    }
  ];

  const subscriptionPlans = [
    { name: "7 Days", price: "$19.99", popular: false },
    { name: "30 Days", price: "$49.99", popular: true },
    { name: "60 Days", price: "$79.99", popular: false },
    { name: "365 Days", price: "$199.99", popular: false }
  ];

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
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Professional Spoofing Tools
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Access premium spoofing utilities, advanced security tools, and cutting-edge software 
            designed for professionals and security researchers.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
            >
              Already a Member? Login
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
              <CardHeader className="text-center">
                <feature.icon className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h3>
          <p className="text-gray-300 mb-8">Select the perfect subscription for your needs</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {subscriptionPlans.map((plan, index) => (
            <Card key={index} className={`bg-black/50 border-purple-500/20 backdrop-blur-lg relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {plan.price}
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => navigate('/register')}
                  className={`w-full ${plan.popular ? 
                    'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 
                    'bg-black/30 border border-purple-500/30 hover:bg-purple-500/10'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Section */}
        <Card className="bg-black/50 border-purple-500/20 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center">
              <Download className="w-6 h-6 mr-2" />
              Sample Downloads Available
            </CardTitle>
            <CardDescription className="text-gray-300">
              Preview the quality of our premium tools with sample files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/10">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Sample_Spoofer_v1.2.exe</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Size: 2.4 MB</span>
                    <span>Demo Version</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/10">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Advanced_Tools_Documentation.pdf</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Size: 1.8 MB</span>
                    <span>User Guide</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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