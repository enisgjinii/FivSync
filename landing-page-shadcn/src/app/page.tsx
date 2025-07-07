import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <span className="inline-block w-8 h-8 bg-primary rounded-full mr-2" />
          Fiverr Extractor
        </div>
        <div className="hidden md:flex gap-6 text-muted-foreground font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <Button className="md:hidden" variant="outline" size="sm">Menu</Button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="flex-1 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Never Lose Your Fiverr Conversations Again
          </h1>
          <p className="text-lg mb-8 opacity-90">
            Extract, backup, and analyze your Fiverr conversations with powerful export tools. Keep your client communications safe and organized.
          </p>
          <div className="flex gap-4">
            <Button size="lg">Learn More</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">View Pricing</Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center mt-12 md:mt-0">
          <Card className="w-[350px] shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Inbox Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="inline-block w-10 h-10 bg-primary rounded-full" />
                  <div>
                    <div className="font-semibold">Client Name <span className="text-xs text-muted-foreground ml-2">2:30 PM</span></div>
                    <div className="text-sm text-muted-foreground">Hi! I loved your work on the previous project...</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <span className="inline-block w-10 h-10 bg-secondary rounded-full" />
                  <div className="text-right">
                    <div className="font-semibold">You <span className="text-xs text-muted-foreground ml-2">2:32 PM</span></div>
                    <div className="text-sm text-muted-foreground">Thank you! I&apos;m glad you liked it. What can I help you with?</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-accent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Powerful Features for Freelancers</h2>
          <p className="text-center text-muted-foreground mb-12">Everything you need to manage and backup your Fiverr conversations</p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Badge variant="secondary">Export</Badge>
                <CardTitle>Multiple Export Formats</CardTitle>
              </CardHeader>
              <CardContent>
                Export your conversations as PDF, Excel, Markdown, JSON, or CSV files. Choose the format that works best for your needs.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Bulk</Badge>
                <CardTitle>Bulk Export</CardTitle>
              </CardHeader>
              <CardContent>
                Export all your conversations at once with our bulk export feature. Save time and keep everything organized.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Analytics</Badge>
                <CardTitle>Conversation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                Get insights into your conversations with detailed analytics. Track message patterns and client interactions.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Attachments</Badge>
                <CardTitle>Attachment Management</CardTitle>
              </CardHeader>
              <CardContent>
                View and download all attachments from your conversations. Keep files organized and accessible.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Privacy</Badge>
                <CardTitle>Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                All processing happens locally in your browser. Your conversations never leave your device and stay completely private.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary">Easy</Badge>
                <CardTitle>Easy to Use</CardTitle>
              </CardHeader>
              <CardContent>
                Simple Chrome extension that works seamlessly with your existing Fiverr account. No complex setup required.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Choose the plan that works best for you</p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✅ Markdown Export</li>
                  <li>✅ JSON Export</li>
                  <li>✅ Basic Conversation View</li>
                  <li>✅ Contact List</li>
                  <li>❌ PDF Export</li>
                  <li>❌ Excel Export</li>
                  <li>❌ Bulk Export</li>
                  <li>❌ Analytics</li>
                </ul>
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </CardContent>
            </Card>
            <Card className="border-primary border-2 shadow-lg">
              <CardHeader>
                <Badge className="mb-2">Most Popular</Badge>
                <CardTitle>Pro <span className="text-primary ml-2">$9.99/mo</span></CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>✅ Everything in Free</li>
                  <li>✅ PDF Export</li>
                  <li>✅ Excel Export</li>
                  <li>✅ Bulk Export All</li>
                  <li>✅ Conversation Analytics</li>
                  <li>✅ Attachment Management</li>
                  <li>✅ Advanced Insights</li>
                  <li>✅ Priority Support</li>
                </ul>
                <Button className="w-full">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Conversations?</h2>
          <p className="mb-8 text-lg opacity-90">Join thousands of freelancers who trust Fiverr Conversation Extractor to backup their important client communications.</p>
          <Button size="lg" className="text-lg px-8 py-6">Get Started Now</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-foreground text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-lg mb-2">Fiverr Extractor</h4>
            <p className="text-muted-foreground">Secure your Fiverr conversations with powerful export tools.</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Features</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><a href="#features" className="hover:text-white">Export Formats</a></li>
              <li><a href="#features" className="hover:text-white">Bulk Export</a></li>
              <li><a href="#features" className="hover:text-white">Analytics</a></li>
              <li><a href="#features" className="hover:text-white">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Support</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <Separator className="bg-white/10 mb-6" />
        <div className="text-center text-muted-foreground">&copy; 2024 Fiverr Conversation Extractor. All rights reserved.</div>
      </footer>
    </div>
  );
}
