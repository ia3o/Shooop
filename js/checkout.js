document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const deliveryForm = document.getElementById('deliveryForm');
    const pickupRadio = document.getElementById('pickup');
    const shipRadio = document.getElementById('ship');
    const pickupDetails = document.getElementById('pickupDetails');
    const shippingDetails = document.getElementById('shippingDetails');
    const pickupEmail = document.getElementById('pickupEmail');
    const pickupPhone = document.getElementById('pickupPhone');

    // Function to toggle delivery details
    function toggleDeliveryDetails() {
        if (pickupRadio && pickupRadio.checked) {
            pickupDetails.classList.remove('hidden');
            shippingDetails.classList.add('hidden');
        } else if (shipRadio && shipRadio.checked) {
            shippingDetails.classList.remove('hidden');
            pickupDetails.classList.add('hidden');
        }
    }

    // Add event listeners for radio buttons
    if (pickupRadio) {
        pickupRadio.addEventListener('change', toggleDeliveryDetails);
    }
    if (shipRadio) {
        shipRadio.addEventListener('change', toggleDeliveryDetails);
    }

    // Form submission handler
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Debug log
            console.log('Form submitted');
            console.log('Pickup checked:', pickupRadio.checked);
            console.log('Pickup email:', pickupEmail.value);
            console.log('Pickup phone:', pickupPhone.value);

            // Check if delivery method is selected
            if (!pickupRadio.checked && !shipRadio.checked) {
                alert('Please select a delivery method.');
                return;
            }

            // Handle pickup validation
            if (pickupRadio.checked) {
                console.log('Pickup selected');
                if (pickupEmail.value.trim() === '' && pickupPhone.value.trim() === '') {
                    alert('Please provide either an email address or phone number for pickup.');
                    return;
                }
                console.log('Pickup validation passed');
                window.location.href = 'payment.html';
                return;
            }

            // Handle shipping validation
            if (shipRadio.checked) {
                const requiredInputs = shippingDetails.querySelectorAll('input[required]');
                let isValid = true;
                
                requiredInputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    alert('Please fill in all required shipping information.');
                    return;
                }
                window.location.href = 'payment.html';
                return;
            }
        });
    }

    // Clear other field when one is being filled
    if (pickupEmail) {
        pickupEmail.addEventListener('input', function() {
            if (this.value.trim()) pickupPhone.value = '';
        });
    }
    
    if (pickupPhone) {
        pickupPhone.addEventListener('input', function() {
            if (this.value.trim()) pickupEmail.value = '';
        });
    }
}); 