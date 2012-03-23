/* Copyright (c) 2006 Mathias Bank (http://www.mathias-bank.de)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
jQuery.fn.extend({
    /**
    * Changes the font-size until there is no line break
    *
    * @example $('div .elem').fit2Box();
    */
    fit2Box: function() {
        if ($(this).css("display") != "block") return;

        //inhalt in zus?tzliche Div backen
        var content = $(this).html();
        $(this).html(""); //delete content because IE sucks

        var fontSize = $(this).css("fontSize").replace("px", "");
        
        var width = $(this).width();
        var height = $(this).height();


        $(this).html('<div id="fit2Box" style="border: 1px solid red; position:absolute;">' + content + '</div>');

        var childElem = $('#fit2Box');
        var cHeight = childElem.height();
        var cWidth = childElem.width();

        //first make bigger (order important!)
        while (cWidth < width || cHeight < height) {
            $(this).css("fontSize", ++fontSize);
            $(this).html('<div id="fit2Box" style="border: 1px solid red; position:absolute;">' + content + '</div>');
            childElem = $('#fit2Box');
            cHeight = childElem.height();
            cWidth = childElem.width();
        }

        //than make smaller
        while (cWidth >= width || cHeight >= height) {
            $(this).css("fontSize", --fontSize);
            $(this).html('<div id="fit2Box" style="border: 1px solid red; position:absolute;">' + content + '</div>');
            childElem = $('#fit2Box');
            cHeight = childElem.height();
            cWidth = childElem.width();
        }

        $(this).html(content);

    }
});