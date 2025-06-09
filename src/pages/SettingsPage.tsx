
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SettingsIcon, SaveIcon, RefreshCwIcon, GlobeIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import SystemSettings from '@/components/SystemSettings';

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('system');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
    language: 'en',
  });

  const handleSaveSettings = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your system settings have been updated successfully.',
      });
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <><RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><SaveIcon className="mr-2 h-4 w-4" /> Save Changes</>
          )}
        </Button>
      </div>

      <Tabs defaultValue="system" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Localization Settings
              </CardTitle>
              <CardDescription>Configure regional settings for your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">(GMT+5:30) India</SelectItem>
                      <SelectItem value="America/New_York">(GMT-4:00) Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">(GMT-7:00) Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">(GMT+1:00) London</SelectItem>
                      <SelectItem value="Asia/Tokyo">(GMT+9:00) Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Set your local timezone for accurate time display</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => handleChange('language', value)}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="ml">Malayalam</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Choose your preferred display language</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Format</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleChange('currency', value)}>
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                      <SelectItem value="JPY">¥ Japanese Yen (JPY)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Set preferred currency for financial calculations</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => handleChange('dateFormat', value)}>
                    <SelectTrigger id="date-format" className="w-full">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (31-12-2025)</SelectItem>
                      <SelectItem value="MM-DD-YYYY">MM-DD-YYYY (12-31-2025)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Choose how dates are displayed throughout the system</p>
                </div>
              </div>

              <div className="mt-6">
                <Card className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <GlobeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Preview Format Examples</h3>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Date: 31-12-2025</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Amount: ₹10,000.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
