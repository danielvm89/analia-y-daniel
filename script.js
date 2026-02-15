/* ========================================
   ANALÍA & DANIEL - WEDDING WEBSITE
   JavaScript: Countdown, RSVP, Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Navigation ----------
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // ---------- Countdown ----------
    const weddingDate = new Date('2026-08-16T15:00:00-05:00'); // 3PM Colombia time (UTC-5)

    function updateCountdown() {
        const now = new Date();
        const diff = weddingDate - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            document.querySelector('.countdown-message').textContent = '¡Hoy es el gran día!';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ---------- Smooth Scroll for Nav Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = nav.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---------- RSVP Form → Google Sheets ----------
    const form = document.getElementById('rsvpForm');
    const successDiv = document.getElementById('rsvpSuccess');

    // Google Apps Script Web App URL
    // The Apps Script handles both RSVP and Gift form submissions
    // It routes data to different sheets based on the form_type parameter
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxRYRbIe5E9VhCXiIBHXfdjhWzk7-fANkcKhqLO2vesOacs1m_avP1fyQ475ZSEpXUNOw/exec';

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.timestamp = new Date().toISOString();

        if (GOOGLE_SHEETS_URL) {
            // Send to Google Sheets via form-encoded POST (most reliable with Apps Script)
            const formBody = new URLSearchParams(data).toString();
            fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            }).then(() => {
                showRSVPSuccess();
            }).catch(() => {
                // Fallback: save locally and still show success
                saveLocalRSVP(data);
                showRSVPSuccess();
            });
        } else {
            // No URL configured yet — save locally
            saveLocalRSVP(data);
            showRSVPSuccess();
        }
    });

    function saveLocalRSVP(data) {
        const rsvpEntries = JSON.parse(localStorage.getItem('rsvp_entries') || '[]');
        rsvpEntries.push(data);
        localStorage.setItem('rsvp_entries', JSON.stringify(rsvpEntries));
    }

    function showRSVPSuccess() {
        form.style.display = 'none';
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ---------- Historia Timeline Fade In ----------
    const timelineRows = document.querySelectorAll('.historia-row');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    timelineRows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(30px)';
        row.style.transition = `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s`;
        timelineObserver.observe(row);
    });

    // Override for visible class
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .historia-row.visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);

    // ---------- Paintings Strip (duplicate for infinite scroll) ----------
    const track = document.querySelector('.paintings-track');
    if (track) {
        const images = track.innerHTML;
        track.innerHTML = images + images; // duplicate for seamless loop
    }

    // ---------- Section Fade In ----------
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        sectionObserver.observe(section);
    });

    // Don't hide the hero initially
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
        hero.style.transform = 'none';
    }

    // ---------- Bilingual i18n System ----------
    const translations = {
        es: {
            'nav.inicio': 'Inicio',
            'nav.countdown': 'Cuenta Regresiva',
            'nav.historia': 'Nuestra Historia',
            'nav.evento': 'Evento',
            'nav.regalos': 'Regalos',
            'hero.subtitle': 'Nos casamos',
            'hero.date': '16 de Agosto de 2026',
            'hero.btn': 'Confirmar Asistencia',
            'hero.scroll': 'Descubre más',
            'countdown.title': 'Faltan',
            'countdown.days': 'Días',
            'countdown.hours': 'Horas',
            'countdown.minutes': 'Minutos',
            'countdown.seconds': 'Segundos',
            'countdown.message': 'para comenzar nuestra historia juntos',
            'countdown.today': '¡Hoy es el gran día!',
            'historia.title': 'Nuestra Historia',
            'historia.subtitle': 'En 2018 comenzó nuestro camino y desde entonces, ha sido imposible separarnos. Tumaco, Madrid, Los Balcanes, Medellín, La Guajira, Chicago, Oxford, Londres, Bogotá y Pereira. 8 años juntos, diferentes geografías, pero siempre con la claridad de caminar este camino juntos.',
            'prewedding.subtitle': 'La fiesta comienza un día antes',
            'prewedding.date': 'Sábado 15 de Agosto, 2026',
            'prewedding.transport': 'Transporte incluido',
            'prewedding.transport_desc': 'Habrá bus para recogerlos',
            'prewedding.description': 'Queremos comenzar la celebración con ustedes un día antes 🎉 Los invitamos a una pool party en Casa Toscana donde podremos empezar a festejar juntos y broncearnos para el Matri el día después. ¡No olviden traer su traje de baño! 👙🩳',
            'prewedding.pinterest': 'Inspiración para el Pool Party',
            'evento.title': 'Matrimonio',
            'evento.subtitle': 'Los esperamos en un lugar mágico rodeado de naturaleza',
            'evento.fecha': '16 de Agosto',
            'evento.fecha_detail': '2026<br>Domingo',
            'evento.hora_detail': 'Ceremonia<br>Hora Colombia',
            'evento.map_title': 'Cómo llegar',
            'evento.map_note': 'Al lado del Farmatodo de Cerritos, entre el Saint Andrews y el Farmatodo',
            'evento.map_link': 'Abrir en Google Maps',
            'dresscode.subtitle': 'Queremos que se sientan cómodos y elegantes',
            'dresscode.women': 'Mujeres',
            'dresscode.women_note': 'Vestido largo, sin tacones puntilla<br>Por favor reservar los colores<br><strong>hueso, blanco y beige</strong><br>para la novia',
            'dresscode.men': 'Hombres',
            'dresscode.men_note': '<strong>Camisa de lino</strong><br>con pantalón beige',
            'dresscode.pinterest_title': 'Inspiración en Pinterest',
            'gifts.title': 'Mesa de Regalos',
            'gifts.subtitle': 'Su presencia es nuestro mejor regalo. Sin embargo, si desean tener un detalle con nosotros, aquí les dejamos algunas opciones.',
            'gifts.honeymoon': 'Luna de Miel',
            'gifts.honeymoon_desc': 'Ayúdanos a hacer realidad nuestro viaje soñado juntos a Italia.',
            'gifts.see_more': 'Ver más',
            'gifts.see_more2': 'Ver más',
            'gifts.home': 'Nuestro Hogar',
            'gifts.home_desc': 'Contribuye a terminar de amoblar nuestra casa.',
            'gifts.envelope': 'Lluvia de Sobres',
            'gifts.envelope_desc': 'Si prefieres, puedes traer un sobre el día del evento. Todo aporte será recibido con mucho cariño.',
            'gifts.modal_instructions': 'Puedes hacer tu aporte a través de cualquiera de estos medios:',
            'gifts.bank_transfer': 'Transferencia Bancaria',
            'gifts.account_type': 'Tipo de cuenta:',
            'gifts.savings': 'Ahorros',
            'gifts.account_number': 'No. de cuenta:',
            'gifts.account_holder': 'Titular:',
            'gifts.nequi_desc': 'Envío rápido desde tu celular',
            'gifts.daviplata_desc': 'Transferencia fácil',
            'gifts.phone_number': 'Número:',
            'gifts.modal_note': 'Al realizar tu aporte, por favor incluye tu nombre en la descripción para que podamos agradecerte personalmente.',
            'gifts.form_contribute': 'Contribuye aquí',
            'gifts.form_or': 'o transfiere directamente',
            'gifts.show_bank': 'Ver datos bancarios',
            'gifts.form_name': 'Tu nombre',
            'gifts.form_name_ph': 'Tu nombre',
            'gifts.form_amount': 'Monto (COP)',
            'gifts.form_amount_ph': '$500.000',
            'gifts.form_message': 'Mensaje (opcional)',
            'gifts.form_message_ph': 'Un mensaje para los novios...',
            'gifts.form_send': 'Enviar',
            'gifts.form_thanks': '¡Gracias por tu generosidad! Los novios recibirán tu mensaje.',
            'rsvp.title': 'Confirmar Asistencia',
            'rsvp.subtitle': 'Por favor confirma tu asistencia antes del <strong>31 de mayo de 2026</strong>.<br>Cada persona debe llenar el formulario individualmente.',
            'rsvp.name': 'Nombre completo',
            'rsvp.name_placeholder': 'Tu nombre completo',
            'rsvp.email': 'Correo electrónico',
            'rsvp.phone': 'Teléfono',
            'rsvp.attend_wedding': '¿Asistirás al matrimonio? (Domingo 16 de Agosto)',
            'rsvp.yes_wedding': '¡Sí, ahí estaré!',
            'rsvp.no_attend': 'No podré asistir',
            'rsvp.attend_prewedding': '¿Asistirás al Pre-Wedding Pool Party? (Sábado 15 de Agosto)',
            'rsvp.yes_prewedding': '¡Sí, cuenta conmigo!',
            'rsvp.no_attend2': 'No podré asistir',
            'rsvp.diet': 'Restricciones alimenticias',
            'rsvp.diet_none': 'Ninguna',
            'rsvp.diet_no_red': 'No como carnes rojas',
            'rsvp.diet_veg': 'Vegetariano',
            'rsvp.diet_vegan': 'Vegano',
            'rsvp.message': 'Mensaje para los novios (opcional)',
            'rsvp.message_placeholder': 'Escríbenos algo bonito...',
            'rsvp.confirm': 'Confirmar',
            'rsvp.thanks': '¡Gracias por confirmar!',
            'rsvp.thanks_msg': 'Hemos recibido tu respuesta. Nos vemos el 16 de agosto.'
        },
        en: {
            'nav.inicio': 'Home',
            'nav.countdown': 'Countdown',
            'nav.historia': 'Our Story',
            'nav.evento': 'Event',
            'nav.regalos': 'Gifts',
            'hero.subtitle': 'We\'re getting married',
            'hero.date': 'August 16, 2026',
            'hero.btn': 'RSVP',
            'hero.scroll': 'Discover more',
            'countdown.title': 'Counting down',
            'countdown.days': 'Days',
            'countdown.hours': 'Hours',
            'countdown.minutes': 'Minutes',
            'countdown.seconds': 'Seconds',
            'countdown.message': 'to begin our story together',
            'countdown.today': 'Today is the big day!',
            'historia.title': 'Our Story',
            'historia.subtitle': 'In 2018, our journey began and since then, it has been impossible to be apart. Tumaco, Madrid, the Balkans, Medellín, La Guajira, Chicago, Oxford, London, Bogotá, and Pereira. 8 years together, different geographies, but always with the certainty of walking this path together.',
            'prewedding.subtitle': 'The celebration starts a day before',
            'prewedding.date': 'Saturday, August 15, 2026',
            'prewedding.transport': 'Transportation included',
            'prewedding.transport_desc': 'A bus will pick you up',
            'prewedding.description': 'We want to kick off the celebration with you a day early 🎉 Join us for a pool party at Casa Toscana where we can start the party and get our tan on before the big day. Don\'t forget your swimsuit! 👙🩳',
            'prewedding.pinterest': 'Pool Party Inspiration',
            'evento.title': 'Wedding',
            'evento.subtitle': 'We\'re waiting for you at a magical place surrounded by nature',
            'evento.fecha': 'August 16',
            'evento.fecha_detail': '2026<br>Sunday',
            'evento.hora_detail': 'Ceremony<br>Colombia Time',
            'evento.map_title': 'How to get there',
            'evento.map_note': 'Next to the Farmatodo in Cerritos, between Saint Andrews and Farmatodo',
            'evento.map_link': 'Open in Google Maps',
            'dresscode.subtitle': 'We want you to feel comfortable and elegant',
            'dresscode.women': 'Women',
            'dresscode.women_note': 'Long dress, no stiletto heels<br>Please reserve the colors<br><strong>ivory, white and beige</strong><br>for the bride',
            'dresscode.men': 'Men',
            'dresscode.men_note': '<strong>Linen shirt</strong><br>with beige pants',
            'dresscode.pinterest_title': 'Pinterest Inspiration',
            'gifts.title': 'Gift Registry',
            'gifts.subtitle': 'Your presence is our greatest gift. However, if you wish to have a gesture with us, here are some options.',
            'gifts.honeymoon': 'Honeymoon',
            'gifts.honeymoon_desc': 'Help us make our dream trip to Italy come true.',
            'gifts.see_more': 'See more',
            'gifts.see_more2': 'See more',
            'gifts.home': 'Our Home',
            'gifts.home_desc': 'Contribute to finishing furnishing our home.',
            'gifts.envelope': 'Cash Gift',
            'gifts.envelope_desc': 'If you prefer, you can bring an envelope on the day of the event. Every contribution will be received with love.',
            'gifts.modal_instructions': 'You can make your contribution through any of these methods:',
            'gifts.bank_transfer': 'Bank Transfer',
            'gifts.account_type': 'Account type:',
            'gifts.savings': 'Savings',
            'gifts.account_number': 'Account number:',
            'gifts.account_holder': 'Account holder:',
            'gifts.nequi_desc': 'Quick transfer from your phone',
            'gifts.daviplata_desc': 'Easy transfer',
            'gifts.phone_number': 'Number:',
            'gifts.modal_note': 'When making your contribution, please include your name in the description so we can thank you personally.',
            'gifts.form_contribute': 'Contribute here',
            'gifts.form_or': 'or transfer directly',
            'gifts.show_bank': 'Show bank details',
            'gifts.form_name': 'Your name',
            'gifts.form_name_ph': 'Your name',
            'gifts.form_amount': 'Amount (COP)',
            'gifts.form_amount_ph': '$500,000',
            'gifts.form_message': 'Message (optional)',
            'gifts.form_message_ph': 'A message for the couple...',
            'gifts.form_send': 'Send',
            'gifts.form_thanks': 'Thank you for your generosity! The couple will receive your message.',
            'rsvp.title': 'RSVP',
            'rsvp.subtitle': 'Please confirm your attendance before <strong>May 31, 2026</strong>.<br>Each person must fill out the form individually.',
            'rsvp.name': 'Full name',
            'rsvp.name_placeholder': 'Your full name',
            'rsvp.email': 'Email',
            'rsvp.phone': 'Phone',
            'rsvp.attend_wedding': 'Will you attend the wedding? (Sunday, August 16)',
            'rsvp.yes_wedding': 'Yes, I\'ll be there!',
            'rsvp.no_attend': 'I won\'t be able to attend',
            'rsvp.attend_prewedding': 'Will you attend the Pre-Wedding Pool Party? (Saturday, August 15)',
            'rsvp.yes_prewedding': 'Yes, count me in!',
            'rsvp.no_attend2': 'I won\'t be able to attend',
            'rsvp.diet': 'Dietary restrictions',
            'rsvp.diet_none': 'None',
            'rsvp.diet_no_red': 'No red meat',
            'rsvp.diet_veg': 'Vegetarian',
            'rsvp.diet_vegan': 'Vegan',
            'rsvp.message': 'Message for the couple (optional)',
            'rsvp.message_placeholder': 'Write us something nice...',
            'rsvp.confirm': 'Confirm',
            'rsvp.thanks': 'Thank you for confirming!',
            'rsvp.thanks_msg': 'We\'ve received your response. See you on August 16.'
        }
    };

    let currentLang = 'es';
    const langToggle = document.getElementById('langToggle');

    function setLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        const t = translations[lang];

        // Text content translations
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        // HTML content translations (for elements with <br>, <strong>, etc.)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (t[key]) el.innerHTML = t[key];
        });

        // Placeholder translations
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });

        // Update toggle button text
        langToggle.textContent = lang === 'es' ? 'EN' : 'ES';

        // Save preference
        localStorage.setItem('wedding_lang', lang);
    }

    langToggle.addEventListener('click', () => {
        setLanguage(currentLang === 'es' ? 'en' : 'es');
    });

    // Restore saved language preference
    const savedLang = localStorage.getItem('wedding_lang');
    if (savedLang && savedLang !== 'es') {
        setLanguage(savedLang);
    }

    // ---------- Gift Modal ----------
    const giftModal = document.getElementById('giftModal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalIcon = document.getElementById('modalIcon');
    const galleryTrack = document.getElementById('giftGalleryTrack');
    const galleryDots = document.getElementById('galleryDots');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');

    // Image galleries per gift type
    // Replace these placeholder paths with your actual images in img/gifts/
    const giftImages = {
        honeymoon: [
            { src: 'img/gifts/amalfi-1.jpg', alt_es: 'Costa Amalfitana, Italia', alt_en: 'Amalfi Coast, Italy' },
            { src: 'img/gifts/amalfi-2.jpg', alt_es: 'Positano, Italia', alt_en: 'Positano, Italy' },
            { src: 'img/gifts/amalfi-3.jpg', alt_es: 'Atrani, Italia', alt_en: 'Atrani, Italy' },
            { src: 'img/gifts/f1-1.jpg', alt_es: 'Gran Premio de F1, Monza', alt_en: 'F1 Grand Prix, Monza' },
            { src: 'img/gifts/f1-2.jpg', alt_es: 'Circuito de Fórmula 1', alt_en: 'Formula 1 Circuit' }
        ],
        home: [
            { src: 'img/gifts/hogar-1.jpg', alt_es: 'Sala de estar', alt_en: 'Living room' },
            { src: 'img/gifts/hogar-2.jpg', alt_es: 'Comedor', alt_en: 'Dining room' },
            { src: 'img/gifts/hogar-3.jpg', alt_es: 'Muebles para el hogar', alt_en: 'Home furniture' }
        ]
    };

    const giftContent = {
        honeymoon: {
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20,12V22H4V12"/><path d="M22,7H2V12H22V7Z"/>
                <path d="M12,22V7"/><path d="M12,7H7.5a2.5,2.5,0,0,1,0-5C11,2,12,7,12,7Z"/>
                <path d="M12,7h4.5a2.5,2.5,0,0,0,0-5C13,2,12,7,12,7Z"/></svg>`,
            title_es: 'Luna de Miel',
            title_en: 'Honeymoon',
            desc_es: 'Ayúdanos a hacer realidad nuestro viaje soñado a Italia: la Costa Amalfitana y un Gran Premio de Fórmula 1.',
            desc_en: 'Help us make our dream trip to Italy come true: the Amalfi Coast and a Formula 1 Grand Prix.'
        },
        home: {
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3,9l9-7,9,7v11a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2Z"/>
                <polyline points="9,22 9,12 15,12 15,22"/></svg>`,
            title_es: 'Nuestro Hogar',
            title_en: 'Our Home',
            desc_es: 'Contribuye a terminar de amoblar nuestra casa con los muebles que nos faltan.',
            desc_en: 'Help us finish furnishing our home with the furniture we still need.'
        }
    };

    // Gallery state
    let galleryIndex = 0;
    let galleryImages = [];

    function initGallery(type) {
        const images = giftImages[type] || [];
        galleryImages = images;
        galleryIndex = 0;

        // Build gallery HTML
        if (images.length > 0) {
            galleryTrack.innerHTML = images.map(img => {
                const alt = currentLang === 'es' ? img.alt_es : img.alt_en;
                return `<img src="${img.src}" alt="${alt}" loading="lazy" onerror="this.parentElement.replaceChild(createGalleryPlaceholder('${alt}'), this)">`;
            }).join('');

            // Build dots
            galleryDots.innerHTML = images.map((_, i) =>
                `<button class="gift-gallery-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>`
            ).join('');

            // Show/hide nav buttons
            galleryPrev.style.display = images.length > 1 ? '' : 'none';
            galleryNext.style.display = images.length > 1 ? '' : 'none';
        } else {
            // No images: show placeholder
            galleryTrack.innerHTML = '';
            const placeholder = document.createElement('div');
            placeholder.className = 'gift-gallery-placeholder';
            placeholder.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/></svg>
                <span>${currentLang === 'es' ? 'Imágenes de referencia' : 'Reference images'}</span>`;
            galleryTrack.appendChild(placeholder);
            galleryDots.innerHTML = '';
            galleryPrev.style.display = 'none';
            galleryNext.style.display = 'none';
        }

        updateGalleryPosition();
    }

    function updateGalleryPosition() {
        galleryTrack.style.transform = `translateX(-${galleryIndex * 100}%)`;

        // Update dots
        galleryDots.querySelectorAll('.gift-gallery-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === galleryIndex);
        });
    }

    galleryPrev.addEventListener('click', () => {
        if (galleryImages.length === 0) return;
        galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
        updateGalleryPosition();
    });

    galleryNext.addEventListener('click', () => {
        if (galleryImages.length === 0) return;
        galleryIndex = (galleryIndex + 1) % galleryImages.length;
        updateGalleryPosition();
    });

    galleryDots.addEventListener('click', (e) => {
        const dot = e.target.closest('.gift-gallery-dot');
        if (dot) {
            galleryIndex = parseInt(dot.dataset.index);
            updateGalleryPosition();
        }
    });

    // Swipe support for mobile
    let touchStartX = 0;
    const galleryEl = document.getElementById('giftGallery');
    galleryEl.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    galleryEl.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50 && galleryImages.length > 1) {
            if (diff > 0) {
                galleryIndex = (galleryIndex + 1) % galleryImages.length;
            } else {
                galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
            }
            updateGalleryPosition();
        }
    }, { passive: true });

    // Helper for broken images
    window.createGalleryPlaceholder = function(alt) {
        const div = document.createElement('div');
        div.className = 'gift-gallery-placeholder';
        div.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/></svg>
            <span>${alt}</span>`;
        return div;
    };

    const giftForm = document.getElementById('giftForm');
    const giftFormSuccess = document.getElementById('giftFormSuccess');
    const giftTipoInput = document.getElementById('giftTipo');

    // Bank accordion toggle
    const bankToggle = document.getElementById('bankToggle');
    const bankAccordion = bankToggle.closest('.bank-accordion');
    bankToggle.addEventListener('click', () => {
        bankAccordion.classList.toggle('open');
    });

    // Make openGiftModal global
    window.openGiftModal = function(type) {
        const content = giftContent[type];
        if (!content) return;

        // Set icon, title, description
        modalIcon.innerHTML = content.icon;
        modalTitle.textContent = currentLang === 'es' ? content.title_es : content.title_en;
        modalDesc.textContent = currentLang === 'es' ? content.desc_es : content.desc_en;

        // Initialize image gallery for this type
        initGallery(type);

        // Set gift type in hidden field
        giftTipoInput.value = type;

        // Reset form state when opening
        giftForm.reset();
        giftForm.style.display = '';
        giftFormSuccess.style.display = 'none';

        // Close bank accordion
        bankAccordion.classList.remove('open');

        // Re-apply translations to modal body elements
        giftModal.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });

        // Re-apply placeholder translations
        giftModal.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) el.placeholder = translations[currentLang][key];
        });

        // Scroll modal to top
        document.querySelector('.gift-modal').scrollTop = 0;

        giftModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeGiftModal() {
        giftModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Gift form submission → Google Sheets
    giftForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = giftForm.querySelector('.gift-form-submit');
        submitBtn.querySelector('span').textContent = currentLang === 'es' ? 'Enviando...' : 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(giftForm);
        const data = Object.fromEntries(formData.entries());
        data.timestamp = new Date().toISOString();
        data.form_type = 'gift'; // To distinguish from RSVP in the sheet

        if (GOOGLE_SHEETS_URL) {
            const formBody = new URLSearchParams(data).toString();
            fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            }).then(() => {
                showGiftSuccess();
            }).catch(() => {
                showGiftSuccess();
            });
        } else {
            showGiftSuccess();
        }
    });

    function showGiftSuccess() {
        giftForm.style.display = 'none';
        giftFormSuccess.style.display = 'block';
    }

    modalClose.addEventListener('click', closeGiftModal);

    giftModal.addEventListener('click', (e) => {
        if (e.target === giftModal) closeGiftModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && giftModal.classList.contains('active')) {
            closeGiftModal();
        }
    });

    // Copy to clipboard for bank details
    document.querySelectorAll('.bank-copyable').forEach(el => {
        el.addEventListener('click', () => {
            const textToCopy = el.getAttribute('data-copy') || el.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                el.classList.add('copied');
                setTimeout(() => el.classList.remove('copied'), 1500);
            });
        });
    });

});
