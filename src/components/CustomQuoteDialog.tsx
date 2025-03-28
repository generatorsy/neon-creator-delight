
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CustomQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  font: string;
  neonColor: string;
  letterColors: Record<number, string>;
  width: number;
  height: number;
  enableTwoLines: boolean;
}

const CustomQuoteDialog = ({
  open,
  onOpenChange,
  text,
  font,
  neonColor,
  letterColors,
  width,
  height,
  enableTwoLines
}: CustomQuoteDialogProps) => {
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [message, setMessage] = React.useState('');
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Błąd",
        description: "Adres email jest wymagany.",
        variant: "destructive"
      });
      return;
    }
    
    // Here we would send the data to a backend
    console.log("Custom quote request:", {
      email,
      phone,
      message,
      neonDetails: {
        text,
        font,
        neonColor,
        letterColors,
        width,
        height,
        enableTwoLines
      }
    });
    
    // Show success message
    toast({
      title: "Dziękujemy!",
      description: "Twoje zapytanie zostało wysłane. Skontaktujemy się z Tobą w ciągu 24 godzin.",
    });
    
    // Reset form and close dialog
    setEmail('');
    setPhone('');
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Indywidualna wycena</DialogTitle>
          <DialogDescription>
            Twój projekt wymaga indywidualnej wyceny. Zostaw swoje dane, a odpowiemy w ciągu 24 godzin.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="required">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="twoj@email.pl" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+48 123 456 789" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Dodatkowe informacje (opcjonalnie)</Label>
            <Input 
              id="message" 
              placeholder="Dodatkowe informacje lub pytania..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full">Wyślij zapytanie</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomQuoteDialog;
