import { MessageCircle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  phone: string;
  message?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppButton({
  phone,
  message = 'Hello Commtech Solutions, I would like to enquire about your products and services.',
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
}: Props) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

  return (
    <Button
      href={whatsappUrl}
      variant={variant}
      size={size}
      external
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || 'Chat on WhatsApp'}
    </Button>
  );
}
