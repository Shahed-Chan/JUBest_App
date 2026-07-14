(function ($) {
  "use strict";

  // Dropdown on mouse hover
  $(document).ready(function () {
    function toggleNavbarMethod() {
      if ($(window).width() > 992) {
        $('.navbar .dropdown').on('mouseover', function () {
          $('.dropdown-toggle', this).trigger('click');
        }).on('mouseout', function () {
          $('.dropdown-toggle', this).trigger('click').blur();
        });
      } else {
        $('.navbar .dropdown').off('mouseover').off('mouseout');
      }
    }
    toggleNavbarMethod();
    $(window).resize(toggleNavbarMethod);
  });


  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 500, 'easeInOutExpo');
    return false;
  });

  // Portfolio isotope and filter
  var portfolioIsotope = $('.portfolio-container').isotope({
    itemSelector: '.portfolio-item',
    layoutMode: 'fitRows'
  });

  $('#portfolio-flters li').on('click', function () {
    $("#portfolio-flters li").removeClass('active');
    $(this).addClass('active');

    portfolioIsotope.isotope({ filter: $(this).data('filter') });
  });


  // Post carousel
  $(".post-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>'
    ],
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 1
      },
      768: {
        items: 2
      },
      992: {
        items: 2
      }
    }
  });


  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    center: true,
    autoplay: true,
    smartSpeed: 2000,
    dots: true,
    loop: true,
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 1
      },
      768: {
        items: 2
      },
      992: {
        items: 3
      }
    }
  });

})(jQuery);

let isAudioPlaying = false;
let previousAudio = null;

function playSoundWithDelay(audioUrl) {
  if (!isAudioPlaying) {
    isAudioPlaying = true;

    const audio = new Audio(audioUrl);

    if (previousAudio) {
      setTimeout(function () {
        previousAudio.pause();
        previousAudio.currentTime = 0;
        audio.play();
        previousAudio = audio;
        isAudioPlaying = false;
      }, 1000); // 1-second delay
    } else {
      audio.play();
      previousAudio = audio;
      isAudioPlaying = false;
    }
  }
}
function sound1() {
  playSoundWithDelay('/audio/alif.mp3');
}

function sound2() {
  playSoundWithDelay('/audio/ba.mp3');
}

function sound3() {
  playSoundWithDelay('/audio/ta.mp3');
}

function sound4() {
  playSoundWithDelay('/audio/tha.mp3');
}

function sound5() {
  playSoundWithDelay('/audio/jiim.mp3');
}

function sound6() {
  playSoundWithDelay('/audio/hha.mp3');
}

function sound7() {
  playSoundWithDelay('/audio/kha.mp3');
}

function sound8() {
  playSoundWithDelay('/audio/daal.mp3');
}

function sound9() {
  playSoundWithDelay('/audio/thaal.mp3');
}

function sound10() {
  playSoundWithDelay('/audio/ra.mp3');
}

function sound11() {
  playSoundWithDelay('/audio/zay.mp3');
}

function sound12() {
  playSoundWithDelay('/audio/siin.mp3');
}

function sound13() {
  playSoundWithDelay('/audio/shiin.mp3');
}

function sound14() {
  playSoundWithDelay('/audio/saad.mp3');
}

function sound15() {
  playSoundWithDelay('/audio/daad.mp3');
}

function sound16() {
  playSoundWithDelay('/audio/taa.mp3');
}

function sound17() {
  playSoundWithDelay('/audio/thaa.mp3');
}

function sound18() {
  playSoundWithDelay('/audio/ayn.mp3');
}

function sound19() {
  playSoundWithDelay('/audio/ghayn.mp3');
}

function sound20() {
  playSoundWithDelay('/audio/fa.mp3');
}

function sound21() {
  playSoundWithDelay('/audio/qaf.mp3');
}

function sound22() {
  playSoundWithDelay('/audio/kaf.mp3');
}

function sound23() {
  playSoundWithDelay('/audio/lam.mp3');
}

function sound24() {
  playSoundWithDelay('/audio/miim.mp3');
}

function sound25() {
  playSoundWithDelay('/audio/nuun.mp3');
}

function sound26() {
  playSoundWithDelay('/audio/ha.mp3');
}

function sound27() {
  playSoundWithDelay('/audio/waw.mp3');
}

function sound28() {
  playSoundWithDelay('/audio/ya.mp3');
}



// Iterate through each play button
const playButtons = document.querySelectorAll('.play-button');

playButtons.forEach(button => {
  button.addEventListener('click', () => {
    const audioUrl = button.getAttribute('data-url');
    const audio = new Audio(audioUrl);

    if (!isAudioPlaying) {
      isAudioPlaying = true;

      if (previousAudio) {
        setTimeout(function () {
          previousAudio.pause();
          previousAudio.currentTime = 0;
          audio.play();
          previousAudio = audio;
          isAudioPlaying = false;
        }, 1000); // 2-second delay
      } else {
        audio.play();
        previousAudio = audio;
        isAudioPlaying = false;
      }
    }
  });
});









