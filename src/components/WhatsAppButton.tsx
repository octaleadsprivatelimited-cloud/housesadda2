export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/916301575658?text=${encodeURIComponent("Hi Houses Adda, I'm interested in your properties.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40"
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all overflow-hidden">
        <img 
          src="/whatsapp-logo.png" 
          alt="WhatsApp" 
          className="w-full h-full object-cover"
        />
      </div>
    </a>
  );
}
