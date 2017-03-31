/**
 * Created by tsasaki on 3/30/17.
 */

jQuery(function($) {
    $('div.roll-up-mode-toggle-switch').click(function() {
        var rollupMode;

        if ($(this).find('input[type="checkbox"]').prop('checked')) {
            console.log("Changed to true");
            rollupMode = "true"
        }
        else {
            console.log("Changed to false");
            rollupMode = "false";
        }

        var curUrl = window.location.pathname;
        var curPosition = $('div.roll-up-mode-toggle-switch > input[type="hidden"]');
        var newUrl;

        if ( curUrl.indexOf('?') > 0 ) {
            newUrl = curUrl + '&' + curPosition.attr('name') + '=' + curPosition.attr('value') + '&roll-up-mode=' + rollupMode;
        } else {
            newUrl = curUrl + '?' + curPosition.attr('name') + '=' + curPosition.attr('value')+ '&roll-up-mode=' + rollupMode;
        }

        console.log(newUrl);
        window.location.href = newUrl;
    })
})
