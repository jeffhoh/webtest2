function findIndex(array, cssClass)
{
    var length = array.length >>> 0;
    var value;
    for (var i = 0; i < length; i++) 
    {
        value = array[i][0];
        if (value == cssClass)
        {
            return i;
        }
    }
    return -1;
}
function comparator(value, index, array)
{
    value = array[index][0];
    return (this == value);
}

function addClass(cssClasses)
{
    var cssClass;
    var index;
    for(var i = 0; i < cssClasses.length; i++)
    {     
        cssClass = cssClasses[i];
        if (typeof cssClass !== 'undefined')
        {
            if (classList.length == 0)
               index = -1;
            else
            {
                index = findIndex(classList, cssClass);
            }
            if (index != -1)
            {
                classList[index][1] = classList[index][1] + 1;
            }
            else
            {
                classList.push([cssClass, 1]);
            }
        }
    }
}

function identifyCSSClass(node, fn)
{
    if (node.hasAttribute('class'))
    {
        fn(node.classList);
    }
}

function findFrameClasses(nodes, fn)
{
    for (var i = 0; i < nodes.length; i++)
    {        
        if ((nodes[i].nodeType == 1 || nodes[i].nodeType == 2))
        {
            identifyCSSClass(nodes[i], fn);
        }
    }
}

function findCSSClasses(nodes, fn)
{
    for (var i = 0; i < nodes.length; i++)
    {        
        if ((nodes[i].nodeType == 1 || nodes[i].nodeType == 2))
        {
            if (nodes[i].tagName == 'IFRAME')
            {
                try
                {
                    var frameDoc = nodes[i].contentDocument || nodes[i].contentWindow.document;
                    if (frameDoc !== 'undefined')
                    {
                        var frameNodes = frameDoc.getElementsByTagName('*');
                        findFrameClasses(frameNodes, fn);
                    }
                }
                catch (err)
                {}
            }
            else
            {
                identifyCSSClass(nodes[i], fn);
            }
        }
    }
}

function setMinMax()
{
    var frequencies = [];
    var len = classList.length;
    for(var i = 0; i < len; i++)
    {
        var value = classList[i][1];
        if (frequencies.indexOf(value) == -1)
        {
            frequencies.push(value);
            if ( maxFrequency < value)
            {
                maxFrequency = value;
            }
            if ( value < minFrequency)
            {
                minFrequency = value;
            }
        }
    }
    frequencies.sort(function(a, b){return b-a});
    return frequencies;
}

function extractNames(frequency)
{
    var names = [];
    var len = classList.length;
    for(var i = 0; i < len; i++)
    {
        if (classList[i][1] == frequency)
        {
            names.push(classList[i][0]);
        }
    }
    names.sort();
    return names;
}
function getFontSize(frequency)
{
    var size = MIN_FONT_SIZE;
    if ( minFrequency !== maxFrequency)
    {
         size = Math.round(((frequency-minFrequency)/(maxFrequency-minFrequency))*(FONT_SIZE_DELTA) + size);
    }
    var font = size + 'pt';
    return font;    
}
    function generateEntry(name, style)
    {
        var entry = document.createElement('span');
        entry.setAttribute('style',style);
        entry.innerHTML = name;
        return entry;
    }
    function generateFrequencyRow(names, colors, fontSize)
    {
        var frequencyRow;
        var entry;

        if( Object.prototype.toString.call(names) === '[object Array]' &&
            names.length > 0)
        {
            if (names.length > 1)
            {
                names.sort();
            }
            frequencyRow = document.createElement('p');
            frequencyRow.style.whitespace = 'pre-line';
            frequencyRow.style.margin = '0em';

            var entryStyle;
            var baseStyle = BASE_STYLE +';font-size:'+fontSize+';background:';   
            var len = names.length;
            for (var i = 0; i < len; i++)
            {
                entryStyle = baseStyle + colors[i%2];
                entry = generateEntry(names[i], entryStyle);
                frequencyRow.appendChild(entry);
            }
        }
        return frequencyRow;
    }
function createContent()
{
    var fontSize;
    var contentNode;
    var len = classList.length;

    if (len == 0)
    {
        return null;
    }
    else
    {
        var contentStyle = 'position:relative;background-color:' + BACKGROUND_COLOR + ';padding:0px 4px;width:100;overflow-y:auto;height:100%';
        contentNode = document.createElement('div');
        contentNode.setAttribute('style', contentStyle);

        var frequenciesList = setMinMax();
        var frequenciesLen = frequenciesList.length;
        var frequecyNode;
        var fillerNode = document.createElement('p');
        contentNode.appendChild(fillerNode);
        for (var j = 0; j < frequenciesLen; j++)
        {
	    var frequencyList = extractNames(frequenciesList[j]);
            fontSize = getFontSize(frequenciesList[j]);
            frequencyNode = generateFrequencyRow(frequencyList, COLORS[j%2], fontSize);
            contentNode.appendChild(frequencyNode);
        }
        fillerNode = document.createElement('p');
        contentNode.appendChild(fillerNode);
    }
    return contentNode;
}

function createDisplayContainer()
{
    var displayNode = document.createElement('div');
    displayNode.id = 'tagCloudDisplayNode';
    var modalStyle = 'display:none;background:#ffffff;position:fixed;z-index:12000;padding:0px 4px;left:0;top:0;width:99%;max-height:100%;overflow:auto';
    displayNode.setAttribute('style', modalStyle);

    var header = document.createElement('div');
    var headerStyle = 'background-color:#fff;padding:0px 16px';
    header.setAttribute('style', headerStyle);

    closeItem= document.createElement('span');
    closeItem.id = 'tagCloudCloseItem';
    var closeStyle = 'color:#0a0a0a;float:right;font-size:20px;font-family:Verdana;cursor:pointer';
    closeItem.setAttribute('style', closeStyle);
    closeItem.innerHTML = 'X';
    var title = document.createElement('p');
    title.setAttribute('style','color:#1e61a3;font-family:Arial;font-size:30');
    var classTitle = document.createElement('strong');
    classTitle.innerHTML = 'Class';
    var counterTitle = document.createElement('span');
    counterTitle.innerHTML = 'Counter';
    title.appendChild(classTitle);
    title.appendChild(counterTitle);
    header.appendChild(closeItem);
    header.appendChild(title);

    displayNode.appendChild(header);
    return displayNode;
}

function createTagCloud()
{
    var nodes = document.body.getElementsByTagName('*');
    findCSSClasses(nodes, addClass);
    var content = createContent();
    if (content == null)
    {
        alert('No CSS classes used on this page');
    }
    else
    {
        displayNode = createDisplayContainer();
        displayNode.appendChild(content);
        document.body.appendChild(displayNode);        
    }
}

var MIN_FONT_SIZE = 10;
var MAX_FONT_SIZE = 30;
var FONT_SIZE_DELTA = 20;
var minFrequency = 600000;
var maxFrequency = 0;
var BACKGROUND_COLOR = '#e0e0cc';
var BLUE_COLORS = ['#3196f9', '#1e61a3'];
var BROWN_COLORS = ['#c03e00','#993300'];
var COLORS = [BLUE_COLORS, BROWN_COLORS];
var BASE_STYLE = 'border-radius:0px 5px 5px 0px;margin:4px 0px 0px 4px;color:#ffffff;padding:8px;display:inline-block;font-family:arial;';

var classList = [];
var displayNode;
var closeItem;
createTagCloud();

function pop() 
{
    displayNode.style.display = 'block';
}
function hide() 
{
    displayNode.style.display = 'none';
    displayNode.parentNode.removeChild(displayNode);
}
closeItem.onclick = function()
{
    hide();
};
document.onkeydown = function(event) 
{
    event = event || window.event;
    if (event.keyCode == 27) 
    {
        hide();
    }
};

pop();