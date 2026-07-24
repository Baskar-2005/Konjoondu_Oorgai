import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const { toast } = useToast();

  const onSubmit = (data: any) => {
    console.log(data);
    toast({
      title: "Message sent!",
      description: "We'll get back to you shortly.",
    });
    reset();
  };

  return (
    <section id="contact" className="py-32 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Connect</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Interested in bulk orders, dealership, or just want to tell us how much you loved the pickle? We're all ears.
            </p>

            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Our Kitchen</h4>
                  <p className="text-muted-foreground">Konjoondu Oorgai, Venpa<br/>49, KDR Nagar, Gundusalai Road<br/>Alpet, Cuddalore – 607001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Call Us</h4>
                  <p className="text-muted-foreground">+91 97903 87121<br/>Mon-Sat, 9AM to 6PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Email</h4>
                  <p className="text-muted-foreground">venpa13g@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 md:p-10 rounded-3xl">
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} required className="bg-background/50 backdrop-blur-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" {...register('phone')} required className="bg-background/50 backdrop-blur-sm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} required className="bg-background/50 backdrop-blur-sm" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Enquiry Type</Label>
                <select 
                  id="type" 
                  {...register('type')} 
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General Enquiry</option>
                  <option value="bulk">Bulk Order / Gifting</option>
                  <option value="dealer">Dealership</option>
                  <option value="export">Export</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" {...register('message')} rows={4} required className="bg-background/50 backdrop-blur-sm resize-none" />
              </div>

              <Button type="submit" className="w-full rounded-xl h-12 text-md">
                Send Message
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}