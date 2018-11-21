  // myDropzone is the configuration for the element that has an id attribute
  // with the value my-dropzone (or myDropzone)

  Dropzone.options.myAwesomeDropzone = {
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 2, // MB
    accept: function(file, done) {
      if (file.name == "justinbieber.jpg") {
        done("Naha, you don't.");
      }
      else { done(); }
    }
  };


  // Dropzone.options.myDropzone = {
  //   init: function() {
  //     this.on("addedfile", function(file) {

  //       // Create the remove button
  //       var removeButton = Dropzone.createElement("<button>Remove file</button>");
        

  //       // Capture the Dropzone instance as closure.
  //       var _this = this;

  //       // Listen to the click event
  //       removeButton.addEventListener("click", function(e) {
  //         // Make sure the button click doesn't submit the form:
  //         e.preventDefault();
  //         e.stopPropagation();

  //         // Remove the file preview.
  //         _this.removeFile(file);
  //         // If you want to the delete the file on the server as well,
  //         // you can do the AJAX request here.
  //       });

  //       // Add the button to the file preview element.
  //       file.previewElement.appendChild(removeButton);
  //     });
  //   }
  // };