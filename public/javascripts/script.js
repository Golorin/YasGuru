var yas = (function () {
  var invalidInput = function (input, error) {
    if (typeof input === 'array' ) {
      _.map(input, function(element) {
        showInputErrors(element);
        console.log(element);
      });
    } else {
      showInputErrors(input, error, true);
    }

    function showInputErrors (inputTitle, inputError, shouldDisplayError) {
      // If data is not included in the input, then highlight the input for the user.
      var input = inputTitle;
      input.addClass('input--error');
      // If the input has no data, then include a helper message as the placeholder.
      if (shouldDisplayError) {
        var errorMessage = inputError.toString();
        input.attr("placeholder", errorMessage);
        // Return false so that the rest of the form does not submit.
      }
    }
  }

  var formHandler = function (res, button) {
    var submitButton = button;
    submitButton.prop("disabled", true);
    var message, $notificationSuccess, $notificationError; // Initialize the variables.
    $notificationSuccess = $('.notification__success');
    $notificationError = $('.notification__error');
    // Set the message variable to the message property of the response object received from the server. Res.message is the custom server response that I coded in on the api route.
    message = res.message;

    // SUCCESSFUL COMPLETION
    if (res.statusCode === 200 || res.statusCode === 201) {
      // Find the success notification on the form and populate the text with the response from the server.
      $notificationError.hide(); // Hide error notification if visible.
      $notificationSuccess.find('.notification__message').text(message);
      // Animate - fade in the message as the notification container slides down.
      $notificationSuccess.fadeIn( 300, function() {
        $notificationSuccess.slideDown('slow');
      });
      // Animate the outro of the message after 5 seconds.
      setTimeout(function() {
        $notificationSuccess.fadeOut( 300, function() {
          $notificationSuccess.slideUp('slow');
          submitButton.prop("disabled", false);
        });
      }, 5000);

      // FAILURE IN SUBMITTING THE FORM
    } else {
      // Find the ERROR notification on the form and populate the text with the response from the server.
      $notificationSuccess.hide(); // Hide success notification if visible.
      $notificationError.find('.notification__message').text(message);
      // Animate - fade in the ERROR message as the notification container slides down.
      $notificationError.fadeIn( 300, function() {
        $notificationError.slideDown('slow');
      });
      // Animate the outro of the message after 5 seconds.
      setTimeout(function() {
        $notificationError.fadeOut( 300, function() {
          $notificationError.slideUp('slow');
          submitButton.prop("disabled", false);
        });
      }, 3000);
    }

    // End the form submit handler.
    return false;
  }

  var checkEmail = function (email_to_test) {
    // Here is the regex pattern to test against.
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    // Check to see if the test passed or failed.
    if (regex.test(email_to_test)) {
      // If the email input passed the test, then return true and continue the rest of the form.
      return true;
    } else {
      invalidInput(email, "Please use a real email address.")
      return false;
    }
  }

  return {
    formHandler: formHandler,
    invalidInput: invalidInput,
    checkEmail: checkEmail
  }


})();


$(document).ready(function() {

  var $signup = $('.email__signup');
  $signup.bind('submit', function(e) {
    e.preventDefault();
    var $this = $(this);

    var $emailInput = $this.find("input[name='email']");
    var email = $emailInput.val();
    var $button = $this.find('button');

    if(!email) {
      yas.invalidInput($email, 'Please fill in your email');
      return false;
    } else {
      yas.checkEmail(email);
    }

    var request = {
      email: email
    }

    $.post('/subscribe', request, function(data) {

      if(data.statusCode === 201 || data.statusCode === 200) {
        $emailInput.val("");
      }

      var successData = data;
      console.log("Email added successfully.");
      yas.formHandler(successData, $button);
    }).fail(function(err){
      // If the ajax response is an error, then parse the JSON data before passing it into the form handler.
      console.log(err);
      var error = JSON.parse(err.responseText);
      // Handle the failure response.
      yas.formHandler(error, $button);
    });
  })
});
