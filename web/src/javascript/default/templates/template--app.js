/**
 * Created by danejacobi on 2/2/17.
 */

jQuery(function($) {
    var SELECT_OPTIONS = {
        width: function() {
            return parseInt(this.element.width(), 10) + 15;
        },
        minimumResultsForSearch: -1
    };

    var isOldIe = !!$('html.lt-ie9').length;

    function SelectSwitcher(target, opts) {
        var $select;
        var $options;
        var $root, $slide, $switch;
        var activeIndex;
        var form;

        var defaults = {
            activeClass: 'active',
            selectHideClass: 'offscreen'
        };
        var settings = {};

        function setSwitchIndex(idx) {
            var classSuffix = '-option';
            var oldActiveClass = settings.activeClass + classSuffix + activeIndex;
            var newActiveClass = settings.activeClass + classSuffix + idx;

            if (idx < 0) {
                return;
            }

            $switch.removeClass(oldActiveClass).addClass(newActiveClass);

            $options.prop('selected', false).eq(idx).prop('selected', true);

            activeIndex = idx;
        }

        function setOptions($select) {
            $options = $select.find('option');
        }

        function bindSelect(target) {
            $select = $(target);
            $select.addClass(settings.selectHideClass);

            setOptions($select);
        }

        function updateSwitchToSelected() {
            activeIndex = $options.filter(':selected').index();
            setSwitchIndex(activeIndex);
        }

        function init() {
            settings = $.extend({}, defaults, opts);
            $root = $(target);

            if ($root.data('switch')) {
                return;
            }

            $switch = $('<div class="switcher-con" />');
            $slide = $('<div class="slide"><span class="slide-grip" /></div>').appendTo($switch);
            form = $root.closest('form.miwt-form').get(0);

            bindSelect($root.find('select'));

            $switch.insertAfter($select);

            $options.each(function(idx, option) {
                $('<span class="option option'+ idx +'"><span class="hint">' + $(option).text() + '</span></span>')
                    .on('click', function(evt) {
                        if (!$('form.miwt-form .windowcontent').length) {
                            setSwitchIndex(idx);
                            //noinspection JSUnresolvedVariable
                            if (miwt && form.miwt_init) {
                                //noinspection JSUnresolvedVariable
                                miwt.observerFormSubmit($select.attr('id'));
                            }
                        }
                    })
                    .appendTo($switch);
            });

            updateSwitchToSelected();

            $root.data('switch', {
                bindSelect: bindSelect,
                setSwitchIndex: setSwitchIndex,
                updateSwitchToSelected: updateSwitchToSelected
            });
        }

        init();
    }

    function updateToggleSwitches() {
        $('.plan-toggle-switch').each(function() {
            var $toggleCon = $(this).parent();
            var switchApi = $toggleCon.data('switch');

            if (switchApi) {
                switchApi.bindSelect($toggleCon.find('select'));
                switchApi.updateSwitchToSelected();
            } else {
                SelectSwitcher($toggleCon, {
                    selectHideClass: 'select2-offscreen'
                });
            }
        });
    };

    function checkForPreCallPlans() {
        var $con = $(this);
        var popupContent = 'Since the call plan is set to "Canceled", this will not be included in the dashboard stats.';

        $con.find('.pre-call-plan-editor .prepared-before-meeting.status-canceled .label').each(function() {
            var $label = $(this);
            if ($label.data('init')) {
                return;
            }

            $label.data('init', true);

            $('<span class="notice"><span class="icon" /></span>')
                .appendTo($label)
                .tooltipster({
                    content: popupContent,
                    maxWidth: 200
                })

        });
    }

    function destroySelectUpdates(context) {
        var $con = $(context || document);

        if (!isOldIe) {
            if ($con.hasClass('select2-offscreen')) {
                $con.not('.plan-toggle-switch').select2('destroy');
            } else {
                $con.find('.select2-offscreen').not('.plan-toggle-switch').select2('destroy');
            }
        }
    }

    function updateMIWT(context) {
        var $con = $(context || document);

        if (!isOldIe) {
            if ($con.is('select')) {
                //noinspection JSUnresolvedVariable
                $con.not('.plan-toggle-switch').select2(SELECT_OPTIONS).on('change', miwt.observerFormSubmit);
            } else {
                //noinspection JSUnresolvedVariable
                $con.find('select').not('.plan-toggle-switch').select2(SELECT_OPTIONS).on('change', miwt.observerFormSubmit);
            }
        }
    }

    function hideCovered() { // ECSELL-691 and ECSELL-718
        $('.one-to-one-editor input[type="checkbox"]').prop('checked', true);
        $('.team-meeting-editor input[type="checkbox"]').prop('checked', true);
    }

    $('form.miwt-form').each(function() {
        var form = this;
        form.submit_options = {
            preProcessNode: function(data) {
                destroySelectUpdates(document.getElementById(data.refid));
                return data.content;
            },
            postProcessNode: function(data) {
                $.each(data, function(idx, d) {
                    updateMIWT(d.node);
                });
            },
            postUpdate: function(data) {
                hideCovered();
                updateToggleSwitches();
                checkForPreCallPlans.call(form);
            }
        };

        hideCovered();
        updateToggleSwitches();
        checkForPreCallPlans.call(form);
        updateMIWT(this);
    });

});