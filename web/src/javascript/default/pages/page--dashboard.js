/**
 * Created by danejacobi on 2/2/17.
 */

jQuery(function($) {

    $('.full-view').each(function() {
        var $con = $(this);
        var $dataPartition = $con.find('.table-partition.data');

        $con.find('.table-partition:first-child .table-part').each(function() {
            var $tablePart = $(this);
            var $allTableParts = $con.find('table[data-table-key="'+$tablePart.data('tableKey')+'"]');

            $allTableParts.on('click', 'thead th.label', function(evt) {
                $allTableParts.toggleClass('closed');
            });

            $allTableParts.on('mouseenter', 'tbody tr', function(evt) {
                var rowIndex = $(this).index();
                $allTableParts.each(function() {
                    $(this).find('tbody tr').eq(rowIndex).addClass('over');
                });
            });

            $allTableParts.on('mouseleave', 'tbody tr', function(evt) {
                var rowIndex = $(this).index();
                $allTableParts.each(function() {
                    $(this).find('tbody tr').eq(rowIndex).removeClass('over');
                });
            });

        });

        //Set up scrolling for the data table partition
        $dataPartition.each(function() {
            var $mcs;
            var scrollSnapSize = $dataPartition.find('td.person-data:eq(0)').outerWidth();

            //Wrap interior in scrollable area for styling purposes
            $dataPartition.wrapInner('<div class="scroller" />');

            $mcs = $dataPartition.find('.scroller');

            //Add frame extra divs for styling purposes
            $(['<div class="picture-frame">',
                '<div class="pf pf-top" /><div class="pf pf-right" /><div class="pf pf-bottom" /><div class="pf pf-left" />',
                '</div>'].join('')).prependTo($dataPartition);

            $mcs.mCustomScrollbar({
                advanced: {
                    updateOnBrowserResize: true,
                    autoExpandHorizontalScroll: true
                },
                scrollButtons: {
                    enable: false
                },
                scrollInertia: 0,
                horizontalScroll: true
            });
        });

        $dataPartition.find('th .person .notifications .notification').each(function() {
            var $notification = $(this);

            $notification.tooltipster({
                content: $notification.data('tooltip'),
                maxWidth: 200
            });
        });

        $dataPartition.find('td.person-data .tooltip').each(function() {
            var $tooltip = $(this);

            $tooltip.closest('td').tooltipster({
                contentAsHTML: true,
                content: $tooltip,
                theme: 'ecsell-popup'
            });
        });

        //Set up sub row switching functionality for pre call plan stages
        $con.find('.table-partition.primary .table-part').each(function() {
            var $table = $(this);
            var $allTableParts = $('.table-partition .table-part');
            var $controlCell = $table.find('tr.joint-sales-calls td.label');
            var $salesRows = $allTableParts.find('tr[data-joint-call-type="sales-stage"]');
            var $trackedGoalsRows = $allTableParts.find('tr[data-joint-call-type="tracked-goal"]');
            var $control;
            var ACTIVE_CLASS = 'active';

            if (!($controlCell.length && $salesRows.length && $trackedGoalsRows.length)) {
                //No control row and not both types
                return;
            }

            function showSelectedSubrows() {
                var controlType = $control.find('option:selected').data('type');

                if (controlType == 'sales-stage') {
                    $salesRows.addClass(ACTIVE_CLASS);
                    $trackedGoalsRows.removeClass(ACTIVE_CLASS);
                } else {
                    $salesRows.removeClass(ACTIVE_CLASS);
                    $trackedGoalsRows.addClass(ACTIVE_CLASS);
                }
            }

            $control = $(['<select class="joint-sales-type-chooser">',
                '<option data-type="sales-stage">Sales Stage</option>',
                '<option data-type="tracked-goal">Account Type</option>',
                '</select>'].join(''))
                .appendTo($controlCell)
                .select2(/*{
                    minimumResultsForSearch: -1,
                    dropdownCss: { width: 110 }
                }*/)
                .on('change', showSelectedSubrows)
                .on('select2-opening', function(evt) {
                    //temp fix for https://github.com/ivaynberg/select2/issues/1541
                    $(this).siblings('.select2-container').find('.select2-search, .select2-focusser').remove();
                });

            showSelectedSubrows();
        });


        //Set up sub row switching functionality for JointEventActivity's JointEventPlan
        $con.find('div.table-partition.primary table.table-part').each(function() {
            var $table = $(this);
            var $allTableParts = $('.table-partition .table-part');
            //For each JointEventActivity's Category Row.
            $table.find('tr.joint-event-activity-categories').each(function () {
                var $controlRow = $(this);
                //console.log($controlRow.data());
                var activityId = '';
                var stages = {};
                var activityExp = /^jointEventActivityId$/;
                var stagesExp = /^jointEventPlanCategory(.+)$/;

                $.each($controlRow.data(), function (i, v) {
                    //console.log(i + ' : ' + v);
                    if (activityExp.test(i)) {
                        activityId = v;
                    }
                    else if (stagesExp.test(i)) {
                        var key = i.match(stagesExp)[1].toLowerCase();
                        stages[key] = v;
                    }
                });
                //console.log(stages);

                var $controlCell = $controlRow.find('td.label');
                var $subRows = $allTableParts.find('tr.subrow.joint-event-plan-stage-'+activityId);

                if (!($controlRow.length && $controlCell.length && $subRows.length)) {
                    //No control row and not both types
                    return;
                }

                var $control;
                var ACTIVE_CLASS = 'active';

                function showSelectedSubrows() {
                    var controlType = $control.find('option:selected').data('joint-event-plan-stage');
                    //console.log(controlType);
                    $subRows.each(function() {
                        $subRow = $(this);
                        $subRow.removeClass(ACTIVE_CLASS);
                        console.log($subRow.data('joint-event-plan-stage'));
                        if ($subRow.data('joint-event-plan-stage') == controlType) {
                            $subRow.addClass(ACTIVE_CLASS);
                        }
                    });
                }

                var optionsHtml = '';
                $.each(stages, function (index, value) {
                    optionsHtml += '<option data-joint-event-plan-stage="' + index + '">' + value + '</option>';
                });

                $control = $(['<select class="joint-event-activity-category-chooser">',
                    optionsHtml,
                    '</select>'].join(''))
                    .appendTo($controlCell)
                    .select2(/*{
                     minimumResultsForSearch: -1,
                     dropdownCss: { width: 110 }
                     }*/)
                    .on('change', showSelectedSubrows)
                    .on('select2-opening', function (evt) {
                        //temp fix for https://github.com/ivaynberg/select2/issues/1541
                        $(this).siblings('.select2-container').find('.select2-search, .select2-focusser').remove();
                    });

                showSelectedSubrows();
            });
        });
    });

    //Fit text to cells
    $('.table-partition.primary th.label').textfill({
        minFontPixels: 8,
        maxFontPixels: 24,
        debug: false
    });

});