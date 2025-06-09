
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Settings, Globe, CreditCard } from 'lucide-react';

// Settings Form Schema
const settingsFormSchema = z.object({
  hostelName: z.string().min(2, { message: "Hostel name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address should be more detailed." }),
  currency: z.string().min(1, { message: "Currency is required." }),
  dateFormat: z.string().min(1, { message: "Date format is required." }),
  timezone: z.string().min(1, { message: "Time zone is required." }),
  defaultMonthlyFee: z.coerce.number().min(1, { message: "Default monthly fee is required." }),
  defaultDeposit: z.coerce.number().min(1, { message: "Default deposit is required." }),
  smsProvider: z.string(),
  apiKey: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const SystemSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Default values for the form
  const defaultValues: SettingsFormValues = {
    hostelName: "Restay PG Management",
    address: "123 Main Street, Bangalore",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Kolkata",
    defaultMonthlyFee: 8000,
    defaultDeposit: 15000,
    smsProvider: "none",
    apiKey: "",
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const onSubmit = (data: SettingsFormValues) => {
    setIsLoading(true);
    
    // In a real app, you would submit to Supabase here
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Settings saved",
        description: "Your system settings have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> 
          System Settings
        </CardTitle>
        <CardDescription>Configure your system settings and defaults</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Brand Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Brand Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your PG management system
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in reports and communications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Regional Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                          <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                          <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                          <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financial Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultMonthlyFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Monthly Fee</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default amount for new students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="defaultDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Security Deposit</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default deposit amount for new students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SMS Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Gateway</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="smsProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMS Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SMS provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="twilio">Twilio</SelectItem>
                          <SelectItem value="msg91">MSG91</SelectItem>
                          <SelectItem value="aws-sns">AWS SNS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select SMS provider for notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("smsProvider") !== "none" && (
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          API key for the selected SMS provider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          variant="outline" 
          className="mr-2" 
          onClick={() => form.reset(defaultValues)}
          type="button"
        >
          Reset
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SystemSettings;
