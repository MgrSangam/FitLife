document.addEventListener('DOMContentLoaded', function() {
  const contentTypeField = document.querySelector('#id_content_type');
  if (contentTypeField) {
      // Function to toggle fields
      const toggleFields = () => {
          const value = contentTypeField.value;
          document.querySelector('.video-content').style.display = value === 'video' ? 'block' : 'none';
          document.querySelector('.blog-content').style.display = value === 'blog' ? 'block' : 'none';
      };
      
      // Initial toggle
      toggleFields();
      
      // Add event listener
      contentTypeField.addEventListener('change', toggleFields);
  }
});