$(document).ready(function () {
    const API_KEY = "AIzaSyC79Tff-TQXxzVnD3SeOPF5lcc_NH0N9Rw";
    const SERVER_URL = "http://localhost:3000";
    let isSlickInitialized = false;

    // ====================== AUTHENTICATION SYSTEM ======================
    
    $('#showSignUp').click(function() {
        $('#loginCard').hide();
        $('#registerCard').show();
    });

    $('#showLogin').click(function() {
        $('#registerCard').hide();
        $('#loginCard').show();
    });

    $('#logoutButton').click(function() {
        localStorage.removeItem('jwtToken');
        $('#mainContent, #navBarWrapper, #logoutButton').hide();
        $('#loginCard').show();
    });
    
    function checkAuth() {
        if (localStorage.getItem('jwtToken')) {
            $('#loginCard, #registerCard').hide();
            $('#mainContent, #navBarWrapper, #logoutButton, #footer').show();
        } else {
            $('#mainContent, #navBarWrapper, #logoutButton, #footer').hide();
            $('#loginCard').show();
        }
    }
    
    // Check authentication on page load
    checkAuth();
    
     // Login Form Submission
     $('#loginForm').submit(function(event) {
        event.preventDefault();
        const userData = {
            username: $('#loginUsername').val(),
            password: $('#loginPassword').val()
        };

        $.ajax({
            type: "POST",
            url: SERVER_URL + '/users/login',
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function(response) {
                localStorage.setItem('jwtToken', response.token);
                checkAuth();
                alert('Login successful.');
		        initializeCarousel();
                setupShiurForm();
                setupContactForm();
            },
            error: function() {
                alert('Login failed. Please check your credentials.');
            }
        });
    });

    // Register Form Submission
    $('#registerForm').submit(function(event) {
        event.preventDefault();
        const userData = {
	    firstname: $('#signupFirstname').val(),
            lastname: $('#signupLastname').val(),
            
            username: $('#signupUsername').val(),
            email: $('#signupEmail').val(),
            password: $('#signupPassword').val()
        };

        $.ajax({
            type: "POST",
            url: SERVER_URL + '/users/register',
            contentType: "application/json",
            data: JSON.stringify(userData),
            success: function() {
                alert('Registration successful. Please log in.');
                $('#registerCard').hide();
                $('#loginCard').show();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(`Registration failed: ${textStatus}`);
            }
        });
    });

    // ====================== SHIUR FUNCTIONALITY ======================
    function initializeCarousel() {
        $.ajax({
            url: `${SERVER_URL}/shiurim`,
            method: "GET",
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') },
            success: function(data) {
                if (data.length > 0) {
                    data.forEach((shiur) => addShiurToCarousel(shiur));
                    setupSlick();
                }
            },
            error: () => showError("Failed to load shiurim", "#statusMessage")
        });
    }

    function addShiurToCarousel(shiur) {
        const widget = $(`
            <div class="widget" data-location="${shiur.location}">
                <div class="widget-header">${shiur.name}</div>
                <div class="widget-title">Title: ${shiur.title}</div>
                <div class="widget-speaker">Speaker: ${shiur.speaker}</div>
                <div class="widget-datetime">${new Date(shiur.datetime).toLocaleString()}</div>
                <div class="widget-location">Location: ${shiur.location}</div>
                <div class="widget-topic">Topic: ${shiur.topic}</div>
            </div>
        `);

        if (!isSlickInitialized) {
            $("#widgetContainer").append(widget);
        }

        return widget;
    }

    function setupSlick() {
        if (!isSlickInitialized && $("#widgetContainer .widget").length > 0) {
            $("#widgetContainer").slick({
                infinite: true,
                slidesToShow: Math.min(3, $("#widgetContainer .widget").length),
                slidesToScroll: 1,
                arrows: true,
                dots: true,
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        },
                    },
                ],
            });
            isSlickInitialized = true;
        }
    }

    function setupShiurForm() {
        $("#userForm").submit(async function (event) {
            event.preventDefault();

            if (!validateForm("#userForm")) {
                showError("Please fill out all required fields.", "#statusMessage");
                return;
            }

            const shiur = {
                name: $("#shiur-name").val().trim(),
                topic: $("#topic").val(),
                location: $("#location").val().trim(),
                speaker: $("#speaker").val().trim(),
                title: $("#title").val().trim(),
                datetime: $("#datetime").val(),
                email: $("#user-email").val().trim(),
            };

            try {
                const valid = await validateLocation(shiur.location);
                if (!valid) {
                    showError("Invalid location address.", "#statusMessage");
                    return;
                }

                $.ajax({
                    url: `${SERVER_URL}/shiurim/addShiur`,
                    method: "POST",
                    contentType: "application/json",
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') },
                    data: JSON.stringify(shiur),
                    success: function (response) {
                        showSuccess(response.message, "#statusMessage");
                        $("#userForm")[0].reset();

                        const newShiur = response.shiur;
                        sessionStorage.setItem("newShiur", JSON.stringify(newShiur));

                        if (isSlickInitialized) {
                            const $newWidget = $(addShiurToCarousel(newShiur));
                            $("#widgetContainer").slick("slickAdd", $newWidget);
                        } else {
                            addShiurToCarousel(newShiur);
                            setupSlick();
                        }

                        document.getElementById("shiur-options").scrollIntoView({ behavior: "smooth" });
                    },
                    error: function (xhr) {
                        showError(xhr.responseJSON?.message || "Failed to submit shiur.", "#statusMessage");
                    },
                });
            } catch (e) {
                showError("Error validating location.", "#statusMessage");
            }
        });
    }

    function setupContactForm() {
        $("#contactForm").submit(function (event) {
            event.preventDefault();

            if (!validateForm("#contactForm")) {
                showError("Please fill out all required fields.", "#contactStatusMessage");
                return;
            }

            const contact = {
                name: $("#contact-name").val().trim(),
                email: $("#contact-email").val().trim(),
                message: $("#message").val().trim(),
            };

            $.ajax({
                url: `${SERVER_URL}/contact`,
                method: "POST",
                contentType: "application/json",
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') },
                data: JSON.stringify(contact),
                success: function (response) {
                    showSuccess(response.message, "#contactStatusMessage");
                    $("#contactForm")[0].reset();
                },
                error: function (xhr) {
                    showError(xhr.responseJSON?.message || "Failed to send message.", "#contactStatusMessage");
                },
            });
        });
    }

    // ====================== UTILITY FUNCTIONS ======================
    function validateForm(formSelector) {
        let isValid = true;
        $(`${formSelector} input[required], ${formSelector} select[required], ${formSelector} textarea[required]`).each(function () {
            if ($(this).val().trim() === "") {
                $(this).addClass("error");
                isValid = false;
            } else {
                $(this).removeClass("error");
            }
        });
        return isValid;
    }

    function showError(message, selector) {
        $(selector).text(message).css("color", "red");
    }

    function showSuccess(message, selector) {
        $(selector).text(message).css("color", "green");
    }

    function validateLocation(location) {
        return new Promise((resolve) => {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;

            $.ajax({
                url: geocodeUrl,
                method: "GET",
                dataType: "json",
                success: function (data) {
                    resolve(data.status === "OK" && data.results.length > 0);
                },
                error: function () {
                    resolve(false);
                }
            });
        });
    }

    $(document).on("click", ".widget", function () {
        updateMap($(this).attr("data-location"));
    });

    function updateMap(location) {
        $("#mapIframe").attr("src",
            `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(location)}`);
    }

    (function($) {
        $.fn.simpleTooltip = function(options) {
            const settings = $.extend({
                tooltipClass: "custom-tooltip"
            }, options);
    
            return this.each(function() {
                const $input = $(this);
                const tooltipText = $input.attr("title");
    
                if (!tooltipText) return;
    
                const $tooltip = $("<div>")
                    .addClass(settings.tooltipClass)
                    .text(tooltipText)
                    .hide()
                    .appendTo("body");
    
                $input.on("mouseenter", function(e) {
                    $tooltip.css({
                        top: e.pageY + 10,
                        left: e.pageX + 10
                    }).fadeIn(200);
                }).on("mousemove", function(e) {
                    $tooltip.css({
                        top: e.pageY + 10,
                        left: e.pageX + 10
                    });
                }).on("mouseleave", function() {
                    $tooltip.fadeOut(200);
                });
            });
        };
    })(jQuery);
    
    // Apply tooltips
    $("#userForm input, #userForm select").each(function() {
        $(this).attr("title", $(this).attr("placeholder")); // Reuse placeholders for tooltip
    });
    $("#userForm input, #userForm select").simpleTooltip();
    

    // ====================== INITIALIZATION ======================
    verifyToken();
    checkAuth();
    
});