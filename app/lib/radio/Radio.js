(function(global)
{

    "use strict";

    var APP = global.app = global.app || {},
        module = APP.module = APP.module || {},

        settings = {
            customEle: 'a',
            containerEle: 'div',
            autoHide: true,
            classPrefix: 'custom-',
            hideCss: {
                /*
                 *position: 'absolute',
                 *left: '-9999px'
                 */
            }
        };


    module.Radio = function(obj)
    {

        var instance = false;

        var $el = $(obj.element),
            $customEl,
            _class = settings.classPrefix + 'radio',
            _group = $el.attr("name"),
            _groupClass = _class + '-' + _group,
            _callback = obj.init || function()
            {},
            opt = obj ? $.extend(
            {}, settings, obj) : settings,
            attachEvents = function()
            {
                $el.focusin(function()
                {
                    $customEl.addClass("focus");
                })
                    .focusout(function()
                {
                    $customEl.removeClass("focus");
                })
                    .change(function()
                {
                    instance.trigger("validate", $el.prop('checked'));
                });

                $customEl.click(function(e)
                {
                    e.preventDefault();

                    $el.prop('checked', true);
                    instance.trigger("validate", true);
                });
            };

        opt.validators = opt.validators || [];

        opt.validators.push(function()
        {
            return $el.prop('checked');
        });

        opt.init = function()
        {
            // hide element
            $el.css(settings.hideCss);

            // create custom element
            $customEl = $("<" + settings.customEle + "/>");

            $customEl.attr(
            {
                id: settings.classPrefix + ($el.attr("id") || $el.attr("name")) + "-" + $el
                    .val(),
                'class': _class + ' customForm-hidden ' + _groupClass
            });

            // append it to the markup before the element
            $el.before($customEl);

            _callback();
        };

        instance = new APP.BaseField(opt);

        instance.bind('validate', function(state)
        {
            // uncheck them
            $('.' + _groupClass).removeClass('checked');

            $customEl[(!state ? 'remove' : 'add') + 'Class']('checked');
        });

        instance.trigger("validate", $el.prop('checked'));

        attachEvents();

        return instance;
    };

}(this));
