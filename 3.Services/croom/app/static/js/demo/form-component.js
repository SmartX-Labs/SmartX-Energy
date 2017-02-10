
// Form-Component.js
// ====================================================================
// This file should not be included in your project.
// This is just a sample how to initialize plugins or components.
//
// - ThemeOn.net -


$(document).ready(function() {


    // CHOSEN
    // =================================================================
    // Require Chosen
    // http://harvesthq.github.io/chosen/
    // =================================================================
    $('#demo-chosen-select').chosen();
    $('#demo-cs-multiselect').chosen({width:'100%'});



    // DEFAULT RANGE SLIDER
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================
    var rs_def = document.getElementById('demo-range-def');
    var rs_def_value = document.getElementById('demo-range-def-val');

    noUiSlider.create(rs_def,{
        start   : [ 20 ],
        connect : 'lower',
        range   : {
            'min': [  0 ],
            'max': [ 100 ]
        }
    });

    rs_def.noUiSlider.on('update', function( values, handle ) {
        rs_def_value.innerHTML = values[handle];
    });




    // RANGE SLIDER - SLIDER STEP BY STEP
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================

    var rs_step = document.getElementById('demo-range-step');
    var rs_step_value = document.getElementById('demo-range-step-val');


    noUiSlider.create(rs_step,{
        start   : [ 20 ],
        connect : 'lower',
        step    : 10,
        range   : {
            'min': [  0 ],
            'max': [ 100 ]
        }
    });

    rs_step.noUiSlider.on('update', function( values, handle ) {
        rs_step_value.innerHTML = values[handle];
    });




    // VERTICAL RANGE SLIDER
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================
    var rs_range_ver1 = document.getElementById('demo-range-ver1');
    var rs_range_ver2 = document.getElementById('demo-range-ver2');
    var rs_range_ver3 = document.getElementById('demo-range-ver3');
    var rs_range_ver4 = document.getElementById('demo-range-ver4');
    var rs_range_ver5 = document.getElementById('demo-range-ver5');


    noUiSlider.create(rs_range_ver1,{
        start: [ 80 ],
        connect: 'lower',
        range: {
            'min':  [20],
            'max':  [100]
        },
        orientation: 'vertical',
        direction: 'rtl'
    });


    noUiSlider.create(rs_range_ver2,{
        start: [ 50 ],
        connect: 'lower',
        range: {
            'min':  [20],
            'max':  [100]
        },
        orientation: 'vertical',
        direction: 'rtl'
    });

    noUiSlider.create(rs_range_ver3,{
        start: [ 30 ],
        connect: 'lower',
        range: {
            'min':  [20],
            'max':  [100]
        },
        orientation: 'vertical',
        direction: 'rtl'
    });

    noUiSlider.create(rs_range_ver4,{
        start: [ 50 ],
        connect: 'lower',
        range: {
            'min':  [20],
            'max':  [100]
        },
        orientation: 'vertical',
        direction: 'rtl'
    });

    noUiSlider.create(rs_range_ver5,{
        start: [ 80 ],
        connect: 'lower',
        range: {
        'min':  [20],
        'max':  [100]
        },
        orientation: 'vertical',
        direction: 'rtl'
    });


    // RANGE SLIDER - DRAG
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================
    var rs_range_drg = document.getElementById('demo-range-drg');

    noUiSlider.create(rs_range_drg, {
        start: [ 40, 60 ],
        behaviour: 'drag',
        connect: true,
        range: {
        'min':  20,
        'max':  80
        }
    });




    // RANGE SLIDER - DRAG-FIXED
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================
    var rs_range_fxt = document.getElementById('demo-range-fxt');

    noUiSlider.create(rs_range_fxt, {
        start: [ 40, 60 ],
        behaviour: 'drag-fixed',
        connect: true,
        range: {
            'min':  20,
            'max':  80
        }
    });





    // RANGE SLIDER PIPS
    // =================================================================
    var range_all_sliders = {
        'min': [ 0 ],
        '25%': [ 50 ],
        '50%': [ 100 ],
        '75%': [ 150 ],
        'max': [ 200 ]
    };



    // RANGE SLIDER - HORIZONTAL PIPS
    // =================================================================
    // Require noUiSlider
    // http://refreshless.com/nouislider/
    // =================================================================
    var rs_range_hpips = document.getElementById('demo-range-hpips');

    noUiSlider.create(rs_range_hpips, {
        range: range_all_sliders,
        connect: 'lower',
        start: 90,
        pips: { // Show a scale with the slider
            mode: 'steps',
            density: 2
        }
    });





    // BOOTSTRAP TIMEPICKER
    // =================================================================
    // Require Bootstrap Timepicker
    // http://jdewit.github.io/bootstrap-timepicker/
    // =================================================================
    $('#demo-tp-com').timepicker();



    // BOOTSTRAP TIMEPICKER - COMPONENT
    // =================================================================
    // Require Bootstrap Timepicker
    // http://jdewit.github.io/bootstrap-timepicker/
    // =================================================================
    $('#demo-tp-textinput').timepicker({
        minuteStep: 5,
        showInputs: false,
        disableFocus: true
    });


    // BOOTSTRAP DATEPICKER
    // =================================================================
    // Require Bootstrap Datepicker
    // http://eternicode.github.io/bootstrap-datepicker/
    // =================================================================
    $('#demo-dp-txtinput input').datepicker();


    // BOOTSTRAP DATEPICKER WITH AUTO CLOSE
    // =================================================================
    // Require Bootstrap Datepicker
    // http://eternicode.github.io/bootstrap-datepicker/
    // =================================================================
    $('#demo-dp-component .input-group.date').datepicker({autoclose:true});


    // BOOTSTRAP DATEPICKER WITH RANGE SELECTION
    // =================================================================
    // Require Bootstrap Datepicker
    // http://eternicode.github.io/bootstrap-datepicker/
    // =================================================================
    $('#demo-dp-range .input-daterange').datepicker({
        format: "MM dd, yyyy",
        todayBtn: "linked",
        autoclose: true,
        todayHighlight: true
    });


    // INLINE BOOTSTRAP DATEPICKER
    // =================================================================
    // Require Bootstrap Datepicker
    // http://eternicode.github.io/bootstrap-datepicker/
    // =================================================================
    $('#demo-dp-inline div').datepicker({
    format: "MM dd, yyyy",
    todayBtn: "linked",
    autoclose: true,
    todayHighlight: true
    });



    // SWITCHERY - CHECKED BY DEFAULT
    // =================================================================
    // Require Switchery
    // http://abpetkov.github.io/switchery/
    // =================================================================
    new Switchery(document.getElementById('demo-sw-checked'));


    // SWITCHERY - UNCHECKED BY DEFAULT
    // =================================================================
    // Require Switchery
    // http://abpetkov.github.io/switchery/
    // =================================================================
    new Switchery(document.getElementById('demo-sw-unchecked'));


    // SWITCHERY - CHECKING STATE
    // =================================================================
    // Require Switchery
    // http://abpetkov.github.io/switchery/
    // =================================================================
    var changeCheckbox = document.getElementById('demo-sw-checkstate'), changeField = document.getElementById('demo-sw-checkstate-field');
    new Switchery(changeCheckbox)
    changeField.innerHTML = changeCheckbox.checked;
    changeCheckbox.onchange = function() {
        changeField.innerHTML = changeCheckbox.checked;
    };


    // SWITCHERY - COLORED
    // =================================================================
    // Require Switchery
    // http://abpetkov.github.io/switchery/
    // =================================================================
    new Switchery(document.getElementById('demo-sw-clr1'), {color:'#489eed'});
    new Switchery(document.getElementById('demo-sw-clr2'), {color:'#35b9e7'});
    new Switchery(document.getElementById('demo-sw-clr3'), {color:'#44ba56'});
    new Switchery(document.getElementById('demo-sw-clr4'), {color:'#f0a238'});
    new Switchery(document.getElementById('demo-sw-clr5'), {color:'#e33a4b'});
    new Switchery(document.getElementById('demo-sw-clr6'), {color:'#2cd0a7'});
    new Switchery(document.getElementById('demo-sw-clr7'), {color:'#8669cc'});
    new Switchery(document.getElementById('demo-sw-clr8'), {color:'#ef6eb6'});


    // SWITCHERY - SIZES
    // =================================================================
    // Require Switchery
    // http://abpetkov.github.io/switchery/
    // =================================================================
    new Switchery(document.getElementById('demo-sw-sz-lg'), { size: 'large' });
    new Switchery(document.getElementById('demo-sw-sz'));
    new Switchery(document.getElementById('demo-sw-sz-sm'), { size: 'small' });






    // DROPZONE.JS
    // =================================================================
    // Require Dropzone
    // http://www.dropzonejs.com/
    // =================================================================
    Dropzone.options.demoDropzone = { // The camelized version of the ID of the form element
        // The configuration we've talked about above
        autoProcessQueue: false,
        //uploadMultiple: true,
        //parallelUploads: 25,
        //maxFiles: 25,

        // The setting up of the dropzone
        init: function() {
        var myDropzone = this;
        //  Here's the change from enyo's tutorial...
        //  $("#submit-all").click(function (e) {
        //  e.preventDefault();
        //  e.stopPropagation();
        //  myDropzone.processQueue();
            //
        //}
        //    );

        }

    }



    // DROPZONE.JS WITH BOOTSTRAP'S THEME
    // =================================================================
    // Require Dropzone
    // http://www.dropzonejs.com/
    // =================================================================
    // Get the template HTML and remove it from the doumenthe template HTML and remove it from the doument
    var previewNode = document.querySelector("#dz-template");
    previewNode.id = "";
    var previewTemplate = previewNode.parentNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);

    var uplodaBtn = $('#dz-upload-btn');
    var removeBtn = $('#dz-remove-btn');
    var myDropzone = new Dropzone(document.body, { // Make the whole body a dropzone
        url: "/target-url", // Set the url
        thumbnailWidth: 50,
        thumbnailHeight: 50,
        parallelUploads: 20,
        previewTemplate: previewTemplate,
        autoQueue: false, // Make sure the files aren't queued until manually added
        previewsContainer: "#dz-previews", // Define the container to display the previews
        clickable: ".fileinput-button" // Define the element that should be used as click trigger to select files.
    });


    myDropzone.on("addedfile", function(file) {
        // Hookup the button
        uplodaBtn.prop('disabled', false);
        removeBtn.prop('disabled', false);
    });

    // Update the total progress bar
    myDropzone.on("totaluploadprogress", function(progress) {
        $("#dz-total-progress .progress-bar").css({'width' : progress + "%"});
    });

    myDropzone.on("sending", function(file) {
        // Show the total progress bar when upload starts
        document.querySelector("#dz-total-progress").style.opacity = "1";
    });

    // Hide the total progress bar when nothing's uploading anymore
    myDropzone.on("queuecomplete", function(progress) {
        document.querySelector("#dz-total-progress").style.opacity = "0";
    });


    // Setup the buttons for all transfers
    uplodaBtn.on('click', function() {
        //Upload all files
        //myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
    });

    removeBtn.on('click', function() {
        myDropzone.removeAllFiles(true);
        uplodaBtn.prop('disabled', true);
        removeBtn.prop('disabled', true);
    });




    // SUMMERNOTE
    // =================================================================
    // Require Summernote
    // http://hackerwins.github.io/summernote/
    // =================================================================
    $('#demo-summernote').summernote({height: 250});




});
