


(function ($, _) {
    
    var swap_started = false,
        isOverHotSpot = false,
        moving = false,
        $hotspot,
        $element,
        $dummyNode,
        dummyNode,
        drg_h,
        drg_w,
        pos_y,
        pos_x;


    // .hotspot are divs that sit on top of the panel and have an opacity
    // of 0. So when the user is dragging a panel, we can detect which panel
    // its is being dragged over and then swap those panels
    $('.hotspot').on('mouseover', function (e) {
        isOverHotSpot = true;
        $hotspot= $(this);
    });

    $('.hotspot').on('mouseout', function (e) {
        isOverHotSpot = false;
    });


    $('.column').on('mousedown', function (e) {
        // We check first that we are not clicking a link of the page
        if (e.target.nodeName !== 'A') {
            if (!moving) {
                $element = $(this);

                drg_w = $element.outerWidth();
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

        }
    });

   

    function mousemove(e) {
        moving = true;

        if (!swap_started) {

            if (isOverHotSpot) {
                swap_started = true;
                performSwap();
                isOverHotSpot = false;
                swap_started = false;
            }

            $dummyNode.offset({
                left: e.pageX + pos_x - drg_w
            });

        }
    }

    // Animates and element back to where it started 
    //when drag was first initiated
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

    function performSwap() {
        var parent = $hotspot.parent();
        $dummyNode.home.top = parent.offset().top;
        $dummyNode.home.left = parent.offset().left;
        swapNodes($element[0], parent[0]);
    }

    function swapNodes(a, b) {
        var aparent = a.parentNode;
        var asibling = a.nextSibling === b ? a : a.nextSibling;
        b.parentNode.insertBefore(a, b);
        aparent.insertBefore(b, asibling);
    }



})(jQuery, _);










