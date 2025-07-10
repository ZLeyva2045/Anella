// src/components/anella/WhatsAppButton.tsx
'use client';

export function WhatsAppButton() {
    const openWhatsApp = () => {
        const phoneNumber = "51987771610";
        const message = encodeURIComponent("¡Hola Anella! 👋 Tengo una consulta sobre sus productos.");
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={openWhatsApp}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-transform duration-300 ease-in-out hover:scale-110 active:animate-button-press"
            aria-label="Contactar por WhatsApp"
        >
             <div className="relative w-full h-full flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <svg className="w-8 h-8 relative" role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-1.07-.26-2.22-1.02-.93-.6-1.6-1.24-2.21-2.04-.18-.23-.37-.47-.55-.71-.57-.75-1.12-1.64-1.15-1.71-.03-.07-.03-.12 0-.18.08-.13.24-.18.39-.23.15-.05.28-.05.41-.03.18.02.35.03.5.18.15.15.24.36.24.51s.05.32 0 .51c-.05.18-.13.39-.24.54-.12.15-.2.24-.28.36.08.13.21.27.36.41.53.5 1.18 1.03 1.92 1.42.1.06.18.09.27.12.33.13.63.29.92.39.24.08.39.03.54-.08.15-.11.41-.58.54-.78.13-.2.24-.18.41-.12.18.06.9.44 1.06.51.16.07.28.1.31.15.04.05.04.1 0 .2zM12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10c.05 0 .1 0 .15-.02-1.42.76-2.95 1.13-4.5 1.13-1.03 0-2.03-.2-2.96-.58-.3-.13-.48-.44-.43-.78.05-.33.33-.58.66-.58.05 0 .11 0 .16.03.88.33 1.81.5 2.78.5 1.34 0 2.65-.3 3.86-.88.24-.12.51-.03.66.19s.03.51-.19.66a9.5 9.5 0 0 1-5.12 1.41 10 10 0 0 1 5.4-15.42 10 10 0 0 0-5.4 15.41c-.48-.23-1.12-1-1.12-1s-.19.04-.5.31c-.31.28-.73.68-1.03.95-.3.27-.58.5-1.13.44-.55-.06-1.18-.3-1.55-.54-.37-.24-.71-.55-1.01-.92-.3-.37-.58-.78-.79-1.24-.21-.46-.4-.96-.4-1.48 0-.51.03-.98.08-1.43.05-.45.1-.88.2-1.3.1-.41.23-.8.4-1.17.18-.37.38-.72.63-1.04.25-.32.53-.61.84-.87s.65-.5 1.01-.71c.36-.21.74-.39 1.13-.53S10.98 2 12 2z"></path></svg>
             </div>
        </button>
    );
}
