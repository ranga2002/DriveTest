(function ($) {
    "use strict";

    document.addEventListener('DOMContentLoaded', function () {
        const loginButton = document.getElementById('loginButton');
        const signupButton = document.getElementById('signupButton');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginButton && signupButton && loginForm && signupForm) {
            loginButton.addEventListener('click', function() {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
                this.classList.add('active');
                signupButton.classList.remove('active');
            });

            signupButton.addEventListener('click', function() {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
                this.classList.add('active');
                loginButton.classList.remove('active');
            });
        }
    });

    // Initiate the wowjs
    new WOW().init();

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
    });

})(jQuery);
