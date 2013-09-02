var moving = false;
var $element;
var $dummyNode;
var dummyNode;
var drg_h,
	drg_w,
	pos_y,
	pos_x;



var $hotstop;
var isOverHotStop = false;

$('.hotspot').on('mouseover', function (e) {

    isOverHotStop = true;
    $hotstop = $(this);

});

$('.hotspot').on('mouseout', function (e) {
    isOverHotStop = false;
});


$('.column').on('mousedown', function (e) {

    if (!moving) {
        $element = $(this);

        drg_h = $element.outerHeight();
        drg_w = $element.outerWidth();
        pos_y = $element.offset().top + drg_h - e.pageY;
        pos_x = $element.offset().left + drg_w - e.pageX;


        // clone the element
        dummyNode = this.cloneNode(true);
        $dummyNode = $(dummyNode);

        this.style.opacity = 0;
        var startTop = $element.offset().top;
        var startLeft = $element.offset().left;


        $dummyNode.home = {};
        $dummyNode.home.top = startTop;
        $dummyNode.home.left = startLeft;

        $dummyNode.css({
            position: 'absolute',
            top: startTop + 'px',
            left: startLeft + 'px',
            width: drg_w + "px",
            opacity: '0.6'
        });

        document.body.appendChild(dummyNode);
        $(document.body).on('mousemove', mousemove);

    }
});


// unselectable="on"   on every element for IE8, ie9


function mousemove(e) {
    moving = true;

    if (isOverHotStop) {

        //var top = Math.abs($hotstop.offset().top - $dummyNode.offset().top);
        //var left = Math.abs($hotstop.offset().left - $dummyNode.offset().left);

        //if (top <= 10 && left <= 10) {
        performSwap();
        //}

    }

    $dummyNode.offset({
        // top: e.pageY + pos_y - drg_h,
        left: e.pageX + pos_x - drg_w
    });
}


function performSwap() {
    var parent = $hotstop.parent();
    $dummyNode.home.top = parent.offset().top;
    $dummyNode.home.left = parent.offset().left;
    swapNodes($element[0], parent[0]);
}

function animate_home(element) {
    element.animate({
        top: element.home.top + 'px',
        left: element.home.left + 'px',
    }, 400, function () {
        $element.css('opacity', 1);
        document.body.removeChild(dummyNode);
    });

    moving = false;
}


$(document.body).on('mouseup', function (e) {

    if (moving) {
        $(document.body).off('mousemove', mousemove);
        animate_home($dummyNode);
    }

});



function swapNodes(a, b) {
    var aparent = a.parentNode;
    var asibling = a.nextSibling === b ? a : a.nextSibling;
    b.parentNode.insertBefore(a, b);
    aparent.insertBefore(b, asibling);
}