
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, AlertCircle } from 'lucide-react';

// Template Schema for notification templates
const templateSchema = z.object({
  enabled: z.boolean().default(true),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  body: z.string().min(10, { message: "Body must be at least 10 characters." }),
});

type TemplateValues = z.infer<typeof templateSchema>;

// Default templates
const defaultTemplates = {
  welcome: {
    enabled: true,
    subject: "Welcome to {{pgName}}!",
    body: "Dear {{studentName}},\n\nWelcome to {{pgName}}! We're excited to have you join our community.\n\nYour room number is {{roomNumber}}. Please let us know if you need any assistance settling in.\n\nBest regards,\nManagement"
  },
  inquiry: {
    enabled: true,
    subject: "Your inquiry about {{pgName}}",
    body: "Dear {{name}},\n\nThank you for your inquiry about {{pgName}}. We have received your message and will get back to you shortly.\n\nBest regards,\nManagement"
  },
  confirmation: {
    enabled: true,
    subject: "Booking Confirmed at {{pgName}}",
    body: "Dear {{studentName}},\n\nWe're pleased to confirm your booking at {{pgName}} starting from {{startDate}}.\n\nRoom details: {{roomType}}, Room #{{roomNumber}}\n\nPending payments: {{pendingAmount}}\n\nBest regards,\nManagement"
  },
  system: {
    enabled: true,
    subject: "System Alert: {{alertType}}",
    body: "Dear Admin,\n\nThis is a system alert notification:\n\n{{alertDetails}}\n\nPlease take necessary action.\n\nBest regards,\nSystem"
  }
};

const NotificationSettings = () => {
  const [activeTab, setActiveTab] = useState("email");
  const [activeTemplate, setActiveTemplate] = useState("welcome");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Forms for different templates
  const welcomeForm = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultTemplates.welcome
  });

  const inquiryForm = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultTemplates.inquiry
  });

  const confirmationForm = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultTemplates.confirmation
  });

  const systemForm = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: defaultTemplates.system
  });

  // Get current form based on active template
  const getCurrentForm = () => {
    switch (activeTemplate) {
      case 'welcome': return welcomeForm;
      case 'inquiry': return inquiryForm;
      case 'confirmation': return confirmationForm;
      case 'system': return systemForm;
      default: return welcomeForm;
    }
  };

  const onSubmit = (data: TemplateValues) => {
    setIsLoading(true);
    
    // In a real app, you would submit to Supabase here
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Template saved",
        description: "Your notification template has been updated successfully.",
      });
    }, 1000);
  };

  // Available template variables for reference
  const templateVariables = {
    welcome: ['{{pgName}}', '{{studentName}}', '{{roomNumber}}'],
    inquiry: ['{{pgName}}', '{{name}}'],
    confirmation: ['{{pgName}}', '{{studentName}}', '{{startDate}}', '{{roomType}}', '{{roomNumber}}', '{{pendingAmount}}'],
    system: ['{{alertType}}', '{{alertDetails}}']
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> 
          Notification Settings
        </CardTitle>
        <CardDescription>
          Customize notification templates and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Templates
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> SMS Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-6 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeTemplate === "welcome" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTemplate("welcome")}
              >
                Welcome Message
              </Button>
              <Button 
                variant={activeTemplate === "inquiry" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTemplate("inquiry")}
              >
                Inquiry Reply
              </Button>
              <Button 
                variant={activeTemplate === "confirmation" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTemplate("confirmation")}
              >
                Booking Confirmation
              </Button>
              <Button 
                variant={activeTemplate === "system" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveTemplate("system")}
              >
                System Alert
              </Button>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">Available Template Variables:</h4>
              <div className="flex flex-wrap gap-2">
                {templateVariables[activeTemplate as keyof typeof templateVariables].map((variable, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-muted-foreground/20 text-xs">
                    {variable}
                  </span>
                ))}
              </div>
            </div>
            
            <Form {...getCurrentForm()}>
              <form onSubmit={getCurrentForm().handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={getCurrentForm().control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Template</FormLabel>
                        <FormDescription>
                          Toggle to enable or disable this notification template
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={getCurrentForm().control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Subject line for the email notification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={getCurrentForm().control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Body</FormLabel>
                      <FormControl>
                        <Textarea rows={8} {...field} />
                      </FormControl>
                      <FormDescription>
                        The content of the email notification. Use variables to personalize.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => getCurrentForm().reset(defaultTemplates[activeTemplate as keyof typeof defaultTemplates])}
                  >
                    Reset to Default
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="sms" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">SMS Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    SMS templates follow the same structure as email templates but with shorter content.
                    Edit each template according to your needs.
                  </p>
                  <Button>Configure SMS Templates</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
