(function($) {
  $(document).ready(function() {
      // Get the fields related to instructor info
      const instructorFields = [
          'id_contact',
          'id_experience',
          'id_bio',
          'id_specialization'
      ];
      
      // Hide instructor fields initially if not an instructor
      if ($('#id_is_instructor').prop('checked') === false) {
          instructorFields.forEach(field => {
              $('#' + field).closest('div').hide();
          });
      }

      // Toggle the visibility of instructor fields when the checkbox is clicked
      $('#id_is_instructor').change(function() {
          if ($(this).prop('checked')) {
              // Show instructor fields
              instructorFields.forEach(field => {
                  $('#' + field).closest('div').show();
              });
          } else {
              // Hide instructor fields
              instructorFields.forEach(field => {
                  $('#' + field).closest('div').hide();
              });
          }
      });
  });
})(django.jQuery);
