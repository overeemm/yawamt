//-----------------------------------------------------------------------
// Copyright (C) Microsoft Corporation. All rights reserved.
//-----------------------------------------------------------------------
// MicrosoftAjaxTemplates.js
// Microsoft AJAX Templating Framework.

Type.registerNamespace("Sys.UI");

Sys.Application.get_isDisposing = function Sys$Application$get_isDisposing() {
    return this._disposing;
}

Sys.Application.disposeElement = function Sys$Application$disposeElement(element, childNodesOnly) {
    /// <param name="element" domElement="true"></param>
    /// <param name="childNodesOnly" type="Boolean"></param>
    var e = Function._validateParams(arguments, [
        {name: "element", domElement: true},
        {name: "childNodesOnly", type: Boolean}
    ]);
    if (e) throw e;

    this._disposeElementRecursive(element);
    if (!childNodesOnly) {
        this._disposeElementInternal(element);
    }
}
Sys.Application._disposeElementRecursive = function Sys$Application$_disposeElementRecursive(element) {
    if (element.nodeType === 1) {
        var childNodes = element.childNodes;
        for (var i = childNodes.length - 1; i >= 0; i--) {
            var node = childNodes[i];
            if (node.nodeType === 1) {
                Sys.Application._disposeElementInternal(node);
                this._disposeElementRecursive(node);
            }
        }
    }
}
Sys.Application._disposeElementInternal = function Sys$Application$_disposeElementInternal(element) {
            var d = element.dispose;
    if (d && typeof(d) === "function") {
        element.dispose();
    }
    else {
        var c = element.control;
        if (c && typeof(c.dispose) === "function") {
            c.dispose();
        }
    }
    var behaviors = element._behaviors;
    if (behaviors) {
        for (var i = behaviors.length - 1; i >= 0; i--) {
            behaviors[i].dispose();
        }
    }
}

Sys.UI.DomElement._oldGetElementById = Sys.UI.DomElement.getElementById;
Sys.UI.DomElement.getElementById = function Sys$UI$DomElement$getElementById(id, element) {
    /// <param name="id" type="String"></param>
    /// <param name="element" domElement="true" optional="true" mayBeNull="true"></param>
    /// <returns domElement="true" mayBeNull="true"></returns>
    var e = Function._validateParams(arguments, [
        {name: "id", type: String},
        {name: "element", mayBeNull: true, domElement: true, optional: true}
    ]);
    if (e) throw e;

    var e = Sys.UI.DomElement._oldGetElementById(id, element);
    if (!e && !element && Sys.UI.Template._contexts.length) {
                var contexts = Sys.UI.Template._contexts;
        for (var i = 0, l = contexts.length; i < l; i++) {
            var context = contexts[i];
            for (var j = 0, m = context.length; j < m; j++) {
                var c = context[j];
                if (c.nodeType === 1) {
                    if (c.id === id) return c;
                    e = Sys.UI.DomElement._oldGetElementById(id, c);
                    if (e) return e;
                }
            }
        }
    }
    return e;
}
if ($get === Sys.UI.DomElement._oldGetElementById) {
    $get = Sys.UI.DomElement.getElementById;
}

Sys.UI.DomElement.isDomElement = function Sys$UI$DomElement$isDomElement(obj) {
                            var val = false;
    if (typeof(obj.nodeType) !== 'number') {
                                var doc = obj.ownerDocument || obj.document || obj;
        if (doc != obj) {
                                    var w = doc.defaultView || doc.parentWindow;
                        val = (w != obj) && !(w.document && obj.document && (w.document === obj.document));
        }
        else {
                                    val = (typeof(doc.body) === 'undefined');
        }
    }
    return !val;
}
Sys.Application.registerMarkupExtension = function Sys$Application$registerMarkupExtension(extensionName, extension, isExpression) {
    var type = Object.getType(extension);
    if (!type.implementsInterface(Sys.UI.IMarkupExtension)) {
        isExpression = ((typeof (isExpression) === "undefined") || (isExpression === true));
        extension = new Sys.UI.GenericMarkupExtension(extension, isExpression);
    }
    if (!this._extensions) {
        this._extensions = {};
    }
    this._extensions[extensionName] = extension;
}
Sys.Application._getMarkupExtension = function Sys$Application$_getMarkupExtension(name) {
    var extension = this._extensions ? this._extensions[name] : null;
    if (!extension) {
                throw Error.invalidOperation("A markup extension with the name '" + name + "' could not be found.");
    }
    return extension;
}
Sys.Application.processNode = function Sys$Application$processNode(element, context, recursive) {
    /// <param name="element" domElement="true"></param>
    /// <param name="context" optional="true" mayBeNull="true"></param>
    /// <param name="recursive" optional="true" mayBeNull="false"></param>
    /// <returns type="Array" elementType="Sys.Component"></returns>
    var e = Function._validateParams(arguments, [
        {name: "element", domElement: true},
        {name: "context", mayBeNull: true, optional: true},
        {name: "recursive", optional: true}
    ]);
    if (e) throw e;

    var context = { userContext: context, localContext: {} };
    return Sys.Application._processNodeWithMappings(
        Sys.Application._getNamespaceMappings(null, [element]),
        element, context, recursive);
}
Sys.Application.processNodes = function Sys$Application$processNodes(elements, context, recursive) {
    /// <param name="elements" type="Array" elementDomElement="true"></param>
    /// <param name="context" optional="true" mayBeNull="true"></param>
    /// <param name="recursive" optional="true" mayBeNull="false"></param>
    /// <returns type="Array" elementType="Sys.Component"></returns>
    var e = Function._validateParams(arguments, [
        {name: "elements", type: Array},
        {name: "context", mayBeNull: true, optional: true},
        {name: "recursive", optional: true}
    ]);
    if (e) throw e;

    var context = { userContext: context, localContext: {} }, element, components = [];
    for (var i = 0, l = elements.length; i < l; i++) {
        element = elements[i];
        Array.addRange(components, Sys.Application._processNodeWithMappings(
            Sys.Application._getNamespaceMappings(null, [element]),
            element, context, recursive));
    }
    return components;
}
Sys.Application._processNodeWithMappings = function Sys$Application$_processNodeWithMappings(namespaceMappings, element, context, recursive) {
    var components = [];
    Sys.Application._processNodeInternal(element, namespaceMappings, components, context, recursive);
    for (var i = 0, l = components.length; i < l; i++) {
        var component = components[i];
        if (Sys.Component.isInstanceOfType(component)) {
            component.endUpdate();
        }
    }
    return components;
}
Sys.Application._processNodeInternal = function Sys$Application$_processNodeInternal(element, namespaceMappings, components, context, recursive) {
        if (element.__msajaxactivated) return;
    var i, l, instance, types = null, key = null;
            try {
        types = element.getAttribute(namespaceMappings.types);
    }
    catch (err) {
    }
    try {
        key = element.getAttribute(namespaceMappings.sysKey);
    }
    catch (err) {
    }
    if (key) {
        context.localContext[key] = element;
    }
    if (types) {
        element.__msajaxactivated = true;
        var typeList = types.split(',');
                var index = {};
        var localComponents = [];
        for (i = 0, l = typeList.length; i < l; i++) {
            var typeName = typeList[i].trim();
            if (index[typeName]) continue;             var type = namespaceMappings.namespaces[typeName];
            if (!type) {
                throw Error.invalidOperation(String.format(Sys.TemplateRes.invalidAttach, namespaceMappings.types, typeName));
            }
            var isComponent = type.inheritsFrom(Sys.Component);
            instance = isComponent && (type.inheritsFrom(Sys.UI.Behavior) || type.inheritsFrom(Sys.UI.Control)) ?
                        new type(element) : new type();
            if (isComponent) {
                localComponents.push(instance);
                instance.beginUpdate();
            }
            index[typeName] = { instance: instance, typeName: typeName, type: type};
            components.push(instance);
        }
                                for (i = 0, l = element.attributes.length; i < l; i++) {
            var attribute = element.attributes[i];
            if (!attribute.specified) continue;
            var nodeName = attribute.nodeName;
            if ((nodeName === namespaceMappings.sysKey) || (nodeName === namespaceMappings.types)) continue;
            var attrib = Sys.Application._splitAttribute(nodeName),
                ns = attrib.ns;
            if (!ns) continue;
            var entry = index[ns];
                        if (!entry) continue;
            if (attrib.name === "sys-key") {
                context.localContext[attribute.nodeValue] = entry.instance;
            }
            else {
                Sys.Application._setProperty(entry.instance, entry.type, attrib.name, attribute.nodeValue, context);
            }
        }
        var app = Sys.Application, creatingComponents = app.get_isCreatingComponents();
        for (i = 0, l = localComponents.length; i < l; i++) {
            instance = localComponents[i];
            if (instance.get_id()) {
                app.addComponent(instance);
            }
            if (creatingComponents) {
                app._createdComponents[app._createdComponents.length] = instance;
            }
        }
    }
    if (recursive || (typeof(recursive) === "undefined")) {
        var className = element.className;
                if (!Sys.UI.Template._isTemplate(element)) {
            for (i = 0, l = element.childNodes.length; i < l; i++) {
                var node = element.childNodes[i];
                                if (node.nodeType !== 3) {
                    Sys.Application._processNodeInternal(node, namespaceMappings, components, context, true);
                }
            }
        }
    }
}
Sys.Application._splitAttribute = function Sys$Application$_splitAttribute(attributeName) {
    var nameParts = attributeName.split(':'),
            ns = nameParts.length > 1 ? nameParts[0] : null,
            name = nameParts[ns ? 1 : 0];
    return { ns: ns, name: name };
}
Sys.Application._getBodyNamespaceMapping = function Sys$Application$_getBodyNamespaceMapping() {
    if (Sys.Application._bodyNamespaceMapping) {
        return Sys.Application._bodyNamespaceMapping;
    }
    var namespaceMapping = {
        sysNamespace: "sys", types: "sys:attach", sysId: "sys:id", sysKey: "sys:key",
        sysActivate: "sys:activate", sysChecked: "sys:checked", styleNamespace: "style",
        classNamespace: "class", namespaces: {}
    };
    Sys.Application._getNamespaceMapping(namespaceMapping, document.body);
    Sys.Application._bodyNamespaceMapping = namespaceMapping;
    return namespaceMapping;
}
Sys.Application._getNamespaceMappings = function Sys$Application$_getNamespaceMappings(existingMapping, elements) {
    var namespaceMappings = existingMapping || Sys.Application._getBodyNamespaceMapping();
    for (var i = 0, l = elements.length; i < l; i++) {
        Sys.Application._getNamespaceMapping(namespaceMappings, elements[i]);
    }
    return namespaceMappings;
}
Sys.Application._getNamespaceMapping = function Sys$Application$_getNamespaceMapping(namespaceMapping, element) {
    var attributes = element.attributes;
    for (var i = 0, l = attributes.length; i < l; i++) {
        var attribute = attributes[i];
        if (!attribute.specified) continue;
        var attrib = Sys.Application._splitAttribute(attribute.nodeName);
        if (attrib.ns !== "xmlns") continue;
        var name = attrib.name;
        var value = attribute.nodeValue.trim();
                if (value.toLowerCase().startsWith("javascript:")) {
            value = value.substr(11).trimStart();
            if (value === "Sys") {
                with(namespaceMapping) {
                    sysNamespace = name;
                    types = name + ":attach";
                    sysId = name + ":id";
                    sysChecked = name + ":checked";
                    sysActivate = name + ":activate";
                    sysKey = name + ":key";
                }
            }
            else {
                                                try {
                    namespaceMapping.namespaces[name] = Type.parse(value);
                }
                catch(e) {
                    throw Error.invalidOperation(String.format(Sys.TemplateRes.invalidTypeNamespace, value));
                }
            }
        }
        else if (value === "http://schemas.microsoft.com/aspnet/style") {
            namespaceMapping.styleNamespace = name;
        }
        else if (value === "http://schemas.microsoft.com/aspnet/class") {
            namespaceMapping.classNamespace = name;
        }
    }
}
Sys.Application._getExtensionCode = function Sys$Application$_getExtensionCode(extension, doEval, context) {
    var name, properties, propertyBag = {}, spaceIndex = extension.indexOf(' ');
    if (spaceIndex !== -1) {
        name = extension.substr(0, spaceIndex);
        properties = extension.substr(spaceIndex + 1).trim();
        if (properties) {
            properties = properties.replace(/\\,/g, '\u0000').split(",");
            for (var i = 0, l = properties.length; i < l; i++) {
                var property = properties[i].replace(/\u0000/g, ","),
                        equalIndex = property.indexOf('='),
                        pValue, pName;
                if (equalIndex !== -1) {
                    pName = property.substr(0, equalIndex).trim();
                    pValue = property.substr(equalIndex + 1).trim();
                    if (doEval) {
                                                pValue = this._getPropertyValue(null, null, pValue, context, true);
                    }
                }
                else {
                    pName = "$default";
                    pValue = property.trim();
                }
                propertyBag[pName] = pValue;
            }
        }
    }
    else {
        name = extension;
    }
    return { instance: Sys.Application._getMarkupExtension(name), name: name, properties: propertyBag };
}

Sys.Application._getPropertyValue = function Sys$Application$_getPropertyValue(target, name, value, context, isExtension) {
    var propertyValue = value;
    if (value.startsWith("{{") && value.endsWith("}}")) {
        propertyValue = this._evaluateExpression(value.slice(2, -2), context);
    }
    else if (!isExtension && value.startsWith("{") && value.endsWith("}")) {
        var extension = this._getExtensionCode(value.slice(1, -1), true, context);
        propertyValue = extension.instance.provideValue(target, name, extension.properties);
    }
    return propertyValue;
}
Sys.Application._setProperty = function Sys$Application$_setProperty(target, type, name, value, context) {
    value = Sys.Application._getPropertyValue(target, name, value, context);
    if (typeof(value) === "undefined") {
        return;
    }
    if (name && (name !== name.toLowerCase())) {
                throw Error.invalidOperation("Declared attribute names must be in lowercase.");
    }
    if (!Sys.Application._trySet(target, type, name, value)) {
        var caseFixedName = Sys.Application._mapToPrototype(name, type);
        if (caseFixedName && (caseFixedName !== name)) {
            Sys.Application._trySet(target, type, caseFixedName, value);
        }
        else {
                                    target[name] = value;
        }
    }
}
Sys.Application._trySet = function Sys$Application$_trySet(target, type, name, value) {
                var setter = target["set_" + name];
    if (typeof(setter) === 'function') {
        setter.call(target, value);
        return true;
    }
    var adder = target["add_" + name];
    if (typeof(adder) === "function") {
        adder.call(target, new Function("sender", "args", value));
        return true;
    }
    if (typeof(target[name]) !== "undefined") {
                target[name] = value;
        return true;
    }
    return false;
}
Sys.Application._mapToPrototype = function Sys$Application$_mapToPrototype(name, type) {
        var caseIndex = Sys.Application._caseIndex[type.__typeName];
    if (!caseIndex) {
        caseIndex = {};
        type.resolveInheritance();
        for (var memberName in type.prototype) {
            if (memberName.startsWith("get_") || memberName.startsWith("set_") || memberName.startsWith("add_")) {
                memberName = memberName.substr(4);
            }
            else if(memberName.startsWith("remove_")) {
                memberName = memberName.substr(7);
            }
            caseIndex[memberName.toLowerCase()] = memberName;
        }
        Sys.Application._caseIndex[type.__typeName] = caseIndex;
    }
    return caseIndex[name.toLowerCase()];
}
Sys.Application._doEval = function Sys$Application$_doEval($expression, $context) {
    with($context.localContext) {
        with($context.userContext || {}) {
            return eval("(" + $expression + ")");
        }
    }
}
Sys.Application._evaluateExpression = function Sys$Application$_evaluateExpression($expression, $context) {
    return Sys.Application._doEval.call($context.userContext, $expression, $context);
}
Sys.Application._caseIndex = {};

Sys.Application._activateOnPartial = function Sys$Application$_activateOnPartial(panel, rendering) {
    var match = Sys.Application._activateList, hasSpan = false;
    if (rendering.indexOf("<!--*") !== -1) {
                                rendering = '<span style="display:none !important">&nbsp;</span>' + rendering;
        hasSpan = true;
    }
    this._updatePanelOld(panel, rendering);
    if (hasSpan) {
                        var span = panel.childNodes[0];
        if (span && (span.nodeType === 1) && (span.tagName.toUpperCase() === "SPAN")) {
            panel.removeChild(span);
        }
    }
    var update = (match === "*" || (panel.id && Array.contains(match, panel.id)));
    if (!update) {
        var node = panel;
        do {
            node = node.parentNode;
            if (node && node.id && Array.contains(match, node.id)) {
                update = true;
                break;
            }
        }
        while (node);
    }
    if (update) {
        Sys.Application.processNode(panel);
    }
}

Sys.Application._activateDOM = function Sys$Application$_activateDOM() {
    var namespaceMapping = Sys.Application._getBodyNamespaceMapping(),
        activateList = document.body.getAttribute(namespaceMapping.sysActivate),
        activateIds;
    if (!activateList) return;
    if (activateList === "*") {
        Sys.Application.processNode(document.body);
    }
    else {
        var activateIds = activateList.split(',');
        for (var i = 0, l = activateIds.length; i < l; i++) {
            var e = document.getElementById(activateIds[i].trim());
            if (e) {
                Sys.Application.processNode(e);
            }
            else {
                        throw Error.invalidOperation("Could not activate element with id '" + activateIds[i] + "', the element could not be found.");
            }
        }
    }
    if (Sys.WebForms && Sys.WebForms.PageRequestManager) {
        Sys.Application._activateList = activateIds || activateList;
        var prm = Sys.WebForms.PageRequestManager.getInstance();
        prm._updatePanelOld = prm._updatePanel;
        prm._updatePanel = Sys.Application._activateOnPartial;
    }
}

Sys.Application.add_init(Sys.Application._activateDOM);
Sys.UI.Template = function Sys$UI$Template(element) {
    /// <param name="element" domElement="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "element", domElement: true}
    ]);
    if (e) throw e;

    this._element = element;
    this._createInstance = null;
    this._instanceId = 0;
}

    function Sys$UI$Template$get_element() {
    if (arguments.length !== 0) throw Error.parameterCount();
        return this._element;
    }
    function Sys$UI$Template$dispose() {
        this._element = null;
        this._createInstance = null;
    }
    function Sys$UI$Template$_appendTextNode(code, storeElementCode, text) {
        code.push(storeElementCode + "document.createTextNode(" +
                    Sys.Serialization.JavaScriptSerializer.serialize(text) +
                    "));\n");
    }
    function Sys$UI$Template$_trySet(code, type, name, expression) {
                                type.resolveInheritance();
        var prototype = type.prototype;
        var setterName = "set_" + name, setter = prototype[setterName];
        if (typeof (setter) === 'function') {
            code.push("  $component." + setterName + "(" + expression + ");\n");
            return true;
        }
        var adderName = "add_" + name, adder = prototype["add_" + name];
        if (typeof (adder) === "function") {
                                    code.push('  $component.' + adderName + '(new Function("sender", "args", ' + expression + "));\n");
            return true;
        }
        if (typeof (prototype[name]) !== "undefined") {
                        code.push("  $component." + name + " = " + expression + ";\n");
            return true;
        }
        return false;
    }
    function Sys$UI$Template$_appendAttributeSetter(namespaceMappings, code, typeIndex, attrib, expression, isExpression, booleanValue) {
        var ns = attrib.ns, name = attrib.name;
        if (ns) {
            if (ns === namespaceMappings.classNamespace) {
                                name = Sys.Serialization.JavaScriptSerializer.serialize(name);
                code.push("  (" + expression + ") ? Sys.UI.DomElement.addCssClass($element, " + name +
                            ") : Sys.UI.DomElement.removeCssClass($element, " + name + ");\n");
                return;
            }
            else if (ns === namespaceMappings.styleNamespace) {
                code.push("  $component = $element;\n  $element." + name + " = " + expression + ";\n;");
                return;
            }
            else {
                var index = typeIndex[ns];
                if (index) {
                                                                                if (name && (name !== name.toLowerCase())) {
                                                throw Error.invalidOperation("Invalid attribute name '" + name + "'. Declared attribute names must be in lowercase.");
                    }
                    code.push("  $component = __componentIndex['" + ns + "'];\n");
                    if (name === "sys-key") {
                        code.push("  __context[" + expression + "] = $component;\n");
                    }
                    else {
                        if (isExpression) {
                            if (!this._trySet(code, index.type, name, expression)) {
                                var caseFixedName = Sys.Application._mapToPrototype(name, index.type);
                                if (caseFixedName && (caseFixedName !== name)) {
                                    this._trySet(code, index.type, caseFixedName, expression);
                                }
                                else {
                                                                                                            code.push("  $component." + name + " = " + expression + ";\n");
                                }                            
                            }
                        }
                        else {
                            code.push("  " + expression + ";\n");
                        }
                    }
                    return;
                }
                else {
                    name = ns + ":" + name;
                }
            }
        }
        if (isExpression) {
            var lowerName = name.toLowerCase();
            if (lowerName.startsWith('on')) {
                                code.push("  $component = $element;\n  __f = new Function(" + expression +
                            ");\n  $element." + name + " = __f;\n");
            }
            else if (lowerName === "style") {
                                                code.push("  $component = $element;\n  $element.style.cssText = " + expression + ";\n");
            }
            else {
                if (booleanValue) {
                                                            code.push("  $component = $element;\n  if (" + expression +
                                ") {\n    __e = document.createAttribute('" + name +
                                "');\n    __e.nodeValue = \"" + booleanValue + "\";\n    $element.setAttributeNode(__e);\n  }\n");
                }
                else {
                    code.push("  $component = $element;\n  __e = document.createAttribute('" + name + "');\n  __e.nodeValue = " +
                            expression + ";\n  $element.setAttributeNode(__e);\n");
                }
            }
        }
        else {
                                    code.push("  $component = $element;\n  " + expression + ";\n");
        }
    }
    function Sys$UI$Template$_translateStyleName(name) {
                if (name.indexOf('-') === -1) return name;
        var parts = name.toLowerCase().split('-');
                var newName = parts[0];
        for (var i = 1, l = parts.length; i < l; i++) {
            var part = parts[i];
            newName += part.substr(0, 1).toUpperCase() + part.substr(1);
        }
        return newName;
    }
    function Sys$UI$Template$_processAttribute(namespaceMappings, code, typeIndex, attrib, value, booleanValue) {
        value = this._getAttributeExpression(attrib, value);
        if (value) {
            this._appendAttributeSetter(namespaceMappings, code, typeIndex, attrib,
                value.code, value.isExpression, booleanValue);
        }
    }
    function Sys$UI$Template$_getAttributeExpression(attrib, value) {
        var type = typeof(value);
        if (type === "undefined") return null;
        if (value === null) return { isExpression: true, code: "null" };      
        if (type === "string") {
            if (value.startsWith("{{") && value.endsWith("}}")) {
                return { isExpression: true, code: value.slice(2, -2).trim() };
            }
            else if (value.startsWith("{") && value.endsWith("}")) {
                var jss = Sys.Serialization.JavaScriptSerializer,
                    ext = Sys.Application._getExtensionCode(value.slice(1, -1)),
                    properties = ext.properties;
                var props = "";
                for (var name in properties) {
                    var subValue = this._getAttributeExpression(attrib, properties[name]);
                    if (subValue && subValue.isExpression) {
                        props += "," + jss.serialize(name) + ":" + subValue.code;
                    }
                }
                return { isExpression: ext.instance.get_isExpression(),
                    code: "__app._getMarkupExtension(" + jss.serialize(ext.name) + ").provideValue($component, " +
                        jss.serialize(attrib.name) +
                        ", {$dataItem:$dataItem,$index:$index,$id:$id" + props + "})" };
            }
        }
        return { isExpression: true, code: Sys.Serialization.JavaScriptSerializer.serialize(value) };
    }
    function Sys$UI$Template$_processBooleanAttribute(element, namespaceMappings, code, typeIndex, name) {
        var value, node = element.getAttributeNode(namespaceMappings.sysNamespace + ":" + name);
        if (!node) {
            node = element.getAttributeNode(name);
            var nodeValue = node ? node.nodeValue : null;
            if (nodeValue && (typeof(nodeValue) === "string") &&
                nodeValue.startsWith("{") && nodeValue.endsWith("}")) {
                                                                throw Error.invalidOperation(String.format("Attribute '{0}' does not support expressions, use 'sys:{0}' instead.", name));
            }
            if (node && (node.specified || (node.nodeValue === true))) {
                                                value = true;
            }
            else {
                return;
            }
        }
        else {
            value = node.nodeValue;
            if (value === "true") {
                value = true;
            }
            else if (value === "false") {
                return;
            }
        }
        this._processAttribute(namespaceMappings, code, typeIndex, { name: name }, value, name);
    }
    function Sys$UI$Template$_processBooleanAttributes(element, namespaceMappings, code, typeIndex, attributes) {
        var name, node, value;
        for (var i = 0, l = attributes.length; i < l; i++) {
            this._processBooleanAttribute(element, namespaceMappings, code, typeIndex, attributes[i]);
        }
    }
    function Sys$UI$Template$_getExplicitAttribute(namespaceMappings, code, typeIndex, element, name, processName) {
        var node;
        try {
            node = element.getAttributeNode(name);
        }
        catch (e) {
            return null;
        }
        if (!node || !node.specified) {
            return null;
        }
        if (processName) {
            var value = (name === "style" ? element.style.cssText : node.nodeValue);
            this._processAttribute(namespaceMappings, code, typeIndex, { name: processName }, value);
        }
        return node.nodeValue;
    }
    function Sys$UI$Template$_buildTemplateCode(nestedTemplates, namespaceMappings, element, code, depth) {
        var i, j, l, m, typeName, isInput,
            expressionRegExp = Sys.UI.Template.expressionRegExp,
            storeElementCode = "  " + (depth ? ("__p[__d-1].appendChild(") : "__topElements.push(");
        code.push("  __d++;\n");
        for (i = 0, l = element.childNodes.length; i < l; i++) {
            var childNode = element.childNodes[i], text = childNode.nodeValue;

            if (childNode.nodeType === 8) {
                if (text.startsWith('*') && text.endsWith('*')) {
                    code.push("  " + text.slice(1, -1) + "\n");
                }
                else {
                    code.push(storeElementCode + "document.createComment(" +
                        Sys.Serialization.JavaScriptSerializer.serialize(text) + "));\n");
                }
            }
            else if (childNode.nodeType === 3) {
                                                if (text.startsWith("{") && text.endsWith("}") && !text.startsWith("{{") && !text.startsWith("}}")) {
                    var attribName, setComponentCode;
                                                            if (element.tagName.toLowerCase() === "textarea") {
                        attribName = "value";
                        setComponentCode = '$component=$element;\n';
                    }
                    else {
                        attribName = "nodeValue";
                        setComponentCode = storeElementCode + '$element=$component=document.createTextNode(""));\n';
                    }
                    var expr = this._getAttributeExpression({name:attribName}, text);
                    if (expr.isExpression) {
                        code.push(storeElementCode + "document.createTextNode(" + expr.code + "));\n");
                    }
                    else {
                                                code.push(setComponentCode + '  ' + expr.code + ';\n');
                    }
                }
                else {
                                        var match = expressionRegExp.exec(text), lastIndex = 0;
                    while (match) {
                        var catchUpText = text.substring(lastIndex, match.index);
                        if (catchUpText) {
                            this._appendTextNode(code, storeElementCode, catchUpText);
                        }
                        code.push(storeElementCode + "document.createTextNode(" + match[1] + "));\n");
                        lastIndex = match.index + match[0].length;
                        match = expressionRegExp.exec(text);
                    }
                    if (lastIndex < text.length) {
                        this._appendTextNode(code, storeElementCode, text.substr(lastIndex));
                    }
                }
            }
            else {
                var attributes = childNode.attributes,
                    typeNames = null, sysAttribute = null, typeIndex = {},
                    tagName = childNode.tagName.toLowerCase(),
                    booleanAttributes,  dp1 = depth + 1;
                if (tagName === "script") {
                                                                                                    continue;
                }
                isInput = (tagName === "input");
                if (isInput) {
                    var typeExpression = this._getAttributeExpression({ name: "type" }, childNode.getAttribute("type"));
                    var nameExpression = this._getAttributeExpression({ name: "name" }, childNode.getAttribute("name"));
                    if (!typeExpression.isExpression || !nameExpression.isExpression) {
                                                throw Error.invalidOperation("Input elements 'type' and 'name' attributes must be explictly set.");
                    }
                    code.push("  $element=__p[__d]=Sys.UI.Template._createInput(" + typeExpression.code + ", " + nameExpression.code + ");\n");
                    booleanAttributes = Sys.UI.Template._inputBooleanAttributes;
                    this._processBooleanAttributes(childNode, namespaceMappings, code, typeIndex, booleanAttributes);
                }
                else {
                    code.push("  $element=__p[__d]=document.createElement('" + childNode.nodeName + "');\n");
                }
                
                                typeNames = this._getExplicitAttribute(namespaceMappings, code, typeIndex, childNode, namespaceMappings.types);
                if (typeNames) {
                    typeNames = typeNames.split(',');
                    code.push("  __componentIndex = {}\n");
                                                            for (j = 0, m = typeNames.length; j < m; j++) {
                        typeName = typeNames[j].trim();
                        if (typeIndex[typeName]) continue;                         var type = namespaceMappings.namespaces[typeName];
                        if (!type) {
                            throw Error.invalidOperation(String.format(Sys.TemplateRes.invalidAttach, namespaceMappings.types, typeName));
                        }
                                                                        var isComponent = type.inheritsFrom(Sys.Component),
                            isControlOrBehavior = (isComponent && (type.inheritsFrom(Sys.UI.Behavior) || type.inheritsFrom(Sys.UI.Control))),
                            isContext = type.implementsInterface(Sys.UI.ITemplateContext);
                        typeIndex[typeName] = { type: type, isComponent: isComponent };
                        code.push("  __components.push(__componentIndex['" + typeName + "'] = $component = new " + type.getName());
                        if (isControlOrBehavior) {
                                                        code.push("($element));\n");
                        }
                        else {
                                                        code.push("());\n");
                        }
                        if (isComponent) {
                                                                                                                code.push("  $component.beginUpdate();\n");
                        }
                        if (isContext) {
                            code.push("  $component.set_parentContext({ dataItem: $dataItem || window, index: $index, id: $id, parentContext: $parentContext });\n");
                        }
                    }
                }
                
                                                                sysAttribute = this._getExplicitAttribute(namespaceMappings, code, typeIndex, childNode, namespaceMappings.sysKey);
                if (sysAttribute) {
                    code.push("  __context[" +
                                Sys.Serialization.JavaScriptSerializer.serialize(sysAttribute) + "] = $element;\n");
                }
                                this._getExplicitAttribute(namespaceMappings, code, typeIndex, childNode, namespaceMappings.sysId, "id");
                                                                this._getExplicitAttribute(namespaceMappings, code, typeIndex, childNode, "style", "style");
                this._getExplicitAttribute(namespaceMappings, code, typeIndex, childNode, "class", "class");
                
                                if (!isInput) {
                    booleanAttributes = Sys.UI.Template._booleanAttributes[tagName] ||
                        Sys.UI.Template._commonBooleanAttributes;
                    this._processBooleanAttributes(childNode, namespaceMappings, code, typeIndex, booleanAttributes);
                }
                
                for (j = 0, m = attributes.length; j < m; j++) {
                    var attribute = attributes[j], name = attribute.nodeName, lowerName = name.toLowerCase();
                                                            if (!attribute.specified && (!isInput || lowerName !== "value")) continue;
                                        if ((lowerName === "class") || (lowerName === "style")) continue;
                                        if (Array.indexOf(booleanAttributes, lowerName) !== -1) continue;
                                        if (isInput && (Array.indexOf(Sys.UI.Template._inputRequiredAttributes, lowerName) !== -1)) continue;
                    var attrib = Sys.Application._splitAttribute(name),
                        ns = attrib.ns,
                        value = attribute.nodeValue;
                    name = attrib.name;
                    if (ns) {
                        if (ns === namespaceMappings.sysNamespace) {
                                                                                    if (Array.indexOf(Sys.UI.Template._sysAttributes, name) !== -1) continue;
                                                        attrib.ns = null;
                        }
                        else if (ns === namespaceMappings.styleNamespace) {
                                                                                    attrib.name = "style." + this._translateStyleName(name);
                        }
                    }
                    this._processAttribute(namespaceMappings, code, typeIndex, attrib, value);
                }
                code.push(storeElementCode + "$element);\n");
                for (typeName in typeIndex) {
                    index = typeIndex[typeName];
                    if (index.isComponent) {
                                                code.push("  if (($component=__componentIndex['" + typeName + "']).get_id()) __app.addComponent($component);\nif (__creatingComponents) __app._createdComponents[__app._createdComponents.length] = $component;\n");
                    }
                }
                                if (Sys.UI.Template._isTemplate(childNode)) {
                                                                                                                                            var nestedTemplate = new Sys.UI.Template(childNode);
                    nestedTemplate.compile();
                    nestedTemplates.push(childNode._msajaxtemplate);
                    code.push("  $element._msajaxtemplate = this.get_element()._msajaxtemplate[1][" + (nestedTemplates.length-1) + "];\n");
                }
                else {
                    this._buildTemplateCode(nestedTemplates, namespaceMappings, childNode, code, dp1);
                                        code.push("  $element=__p[__d];\n");
                }
            }
        }
        code.push("  --__d;\n");
    }
    function Sys$UI$Template$compile() {
        if (!this._createInstance) {
            var element = this.get_element();
            if (element._msajaxtemplate) {
                this._createInstance = element._msajaxtemplate[0];
            }
            else {
                var code = [" $index = (typeof($index) === 'number' ? $index : __instanceId);\n var __context = {}, $component, __app = Sys.Application, __creatingComponents = __app.get_isCreatingComponents(), __components = [], __componentIndex, __e, __f, __topElements = [], __d = 0, __p = [__containerElement], $id = Sys.UI.Template._getIdFunction($index), $element = __containerElement;\n Sys.UI.Template._contexts.push(__topElements);\n with(__context) { with($dataItem || {}) {\n"];
                var namespaceMappings = Sys.Application._getNamespaceMappings(null, [element]);
                var nestedTemplates = [];
                this._buildTemplateCode(nestedTemplates, namespaceMappings, element, code, 0);
                                                code.push("} }\n  for (var __i = 0, __l = __topElements.length; __i < __l; __i++) {\n  __containerElement.appendChild(__topElements[__i]);\n }\n");
                code.push(" Sys.UI.Template._contexts.pop();\n");                 code.push(" return new Sys.UI.TemplateResult(this, __containerElement, __topElements, __components);");
                code = code.join('');
                element._msajaxtemplate = [this._createInstance = new Function("__containerElement", "$dataItem", "$index", "$parentContext", "__instanceId", code), nestedTemplates];
            }
        }
    }
    function Sys$UI$Template$createInstance(container, dataItem, dataIndex, parentContext) {
        /// <param name="container" domElement="true"></param>
        /// <param name="dataItem" optional="true" mayBeNull="true"></param>
        /// <param name="dataIndex" optional="true" mayBeNull="true" type="Number" integer="true"></param>
        /// <param name="parentContext" optional="true" mayBeNull="true"></param>
        /// <returns type="Sys.UI.TemplateResult"></returns>
        var e = Function._validateParams(arguments, [
            {name: "container", domElement: true},
            {name: "dataItem", mayBeNull: true, optional: true},
            {name: "dataIndex", type: Number, mayBeNull: true, integer: true, optional: true},
            {name: "parentContext", mayBeNull: true, optional: true}
        ]);
        if (e) throw e;

        this.compile();
        return this._createInstance(container, dataItem, dataIndex, parentContext, this._instanceId++);
    }
Sys.UI.Template.prototype = {
    get_element: Sys$UI$Template$get_element,
    dispose: Sys$UI$Template$dispose,
    _appendTextNode: Sys$UI$Template$_appendTextNode,
    _trySet: Sys$UI$Template$_trySet,
    _appendAttributeSetter: Sys$UI$Template$_appendAttributeSetter,
    _translateStyleName: Sys$UI$Template$_translateStyleName,
    _processAttribute: Sys$UI$Template$_processAttribute,
    _getAttributeExpression: Sys$UI$Template$_getAttributeExpression,
    _processBooleanAttribute: Sys$UI$Template$_processBooleanAttribute,
    _processBooleanAttributes: Sys$UI$Template$_processBooleanAttributes,
    _getExplicitAttribute: Sys$UI$Template$_getExplicitAttribute,
    _buildTemplateCode: Sys$UI$Template$_buildTemplateCode,
    compile: Sys$UI$Template$compile,
    createInstance: Sys$UI$Template$createInstance
}
Sys.UI.Template._getIdFunction = function Sys$UI$Template$_getIdFunction(instance) {
    return function(prefix) {
        return prefix + instance;
    }
}
Sys.UI.Template._createInput = function Sys$UI$Template$_createInput(type, name) {
    var element, dynamic = Sys.UI.Template._dynamicInputs;
    if (dynamic === true) {
        element = document.createElement('input');
        if (type) {
            element.type = type;
        }
        if (name) {
            element.name = name;
        }
    }
    else {
        var html = "<input ";
        if (type) {
            html += "type='" + type + "' ";
        }
        if (name) {
            html += "name='" + name + "' ";
        }
        html += "/>";
        try {
            element = document.createElement(html);
        }
        catch (err) {
            Sys.UI.Template._dynamicInputs = true;
            return Sys.UI.Template._createInput(type, name);
        }
        if (dynamic !== false) {
            if (element.tagName.toLowerCase() === "input") {
                Sys.UI.Template._dynamicInputs = false;
            }
            else {
                Sys.UI.Template._dynamicInputs = true;
                return Sys.UI.Template._createInput(type, name);
            }
        }
    }
    return element;
}
Sys.UI.Template._isTemplate = function Sys$UI$Template$_isTemplate(element) {
    var className = element.className;
    return (className && ((className === "sys-template") || Array.contains(className.split(' '), "sys-template")));
}
Sys.UI.Template._contexts = [];
Sys.UI.Template._inputRequiredAttributes = ["type", "name"];
Sys.UI.Template._commonBooleanAttributes = ["disabled"];
Sys.UI.Template._inputBooleanAttributes = ["disabled", "checked", "readonly"];
Sys.UI.Template._booleanAttributes = {
    "input": Sys.UI.Template._inputBooleanAttributes,
    "select": ["disabled", "multiple"],
    "option": ["disabled", "selected"],
    "img": ["disabled", "ismap"],
    "textarea": ["disabled", "readonly"]
};
Sys.UI.Template._sysAttributes = ["attach", "id", "key",
    "disabled", "checked", "readonly", "ismap", "multiple", "selected"];
Sys.UI.Template.expressionRegExp = /\{\{\s*([\w\W]*?)\s*\}\}/g;
Sys.UI.Template.registerClass("Sys.UI.Template", null, Sys.IDisposable);

Sys.UI.TemplateResult = function Sys$UI$TemplateResult(template, container, elements, components) {
    
                        this._template = template;
    this._container = container;
    this._elements = elements;
    this._components = components;
}

    function Sys$UI$TemplateResult$get_container() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._container || null;
    }
    function Sys$UI$TemplateResult$get_components() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._components || [];
    }
    function Sys$UI$TemplateResult$get_elements() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._elements || [];
    }
    function Sys$UI$TemplateResult$get_template() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._template || null;
    }
    function Sys$UI$TemplateResult$dispose() {
        var elements = this.get_elements();
        if (elements) {
            for (var i = 0, l = elements.length; i < l; i++) {
                var element = elements[i];
                if (element.nodeType === 1) {
                    Sys.Application.disposeElement(element, false);
                }
            }
        }
        this._template = null;
        this._elements = null;
        this._components = null;
        this._container = null;
    }
    function Sys$UI$TemplateResult$initializeComponents() {
        var components = this.get_components();
        if (components) {
            for (var i = 0, l = components.length; i < l; i++) {
                var component = components[i];
                if (Sys.Component.isInstanceOfType(component)) {
                    if (component.get_isUpdating()) {
                        component.endUpdate();
                    }
                    else if (!component.get_isInitialized()) {
                        component.initialize();
                    }
                }
            }
        }
    }
Sys.UI.TemplateResult.prototype = {
    get_container: Sys$UI$TemplateResult$get_container,
    get_components: Sys$UI$TemplateResult$get_components,
    get_elements: Sys$UI$TemplateResult$get_elements,
    get_template: Sys$UI$TemplateResult$get_template,
    dispose: Sys$UI$TemplateResult$dispose,
    initializeComponents: Sys$UI$TemplateResult$initializeComponents
}
Sys.UI.TemplateResult.registerClass("Sys.UI.TemplateResult", null, Sys.IDisposable);
Sys.UI.ITemplateContext = function Sys$UI$ITemplateContext() {
}

    function Sys$UI$ITemplateContext$get_parentContext() {
        if (arguments.length !== 0) throw Error.parameterCount();
        throw Error.notImplemented();
    }
    function Sys$UI$ITemplateContext$set_parentContext() {
        throw Error.notImplemented();
    }
Sys.UI.ITemplateContext.prototype = {
    get_parentContext: Sys$UI$ITemplateContext$get_parentContext,
    set_parentContext: Sys$UI$ITemplateContext$set_parentContext
}
Sys.UI.ITemplateContext.registerInterface("Sys.UI.ITemplateContext");
Sys.UI.IMarkupExtension = function Sys$UI$IMarkupExtension() {
}

    function Sys$UI$IMarkupExtension$get_isExpression() {
        if (arguments.length !== 0) throw Error.parameterCount();
        throw Error.notImplemented();
    }
    function Sys$UI$IMarkupExtension$provideValue(component, propertyName, properties) {
        throw Error.notImplemented();
    }
Sys.UI.IMarkupExtension.prototype = {
    get_isExpression: Sys$UI$IMarkupExtension$get_isExpression,
    provideValue: Sys$UI$IMarkupExtension$provideValue
}
Sys.UI.IMarkupExtension.registerInterface("Sys.UI.IMarkupExtension");
Sys.UI.GenericMarkupExtension = function Sys$UI$GenericMarkupExtension(provideValueFunction, isExpression) {
    this._provideValue = provideValueFunction;
    this._isExpression = isExpression;
}

    function Sys$UI$GenericMarkupExtension$get_isExpression() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._isExpression;
    }
    function Sys$UI$GenericMarkupExtension$provideValue(component, propertyName, properties) {
        return this._provideValue(component, propertyName, properties);
    }
Sys.UI.GenericMarkupExtension.prototype = {
    get_isExpression: Sys$UI$GenericMarkupExtension$get_isExpression,
    provideValue: Sys$UI$GenericMarkupExtension$provideValue
}
Sys.UI.GenericMarkupExtension.registerClass("Sys.UI.GenericMarkupExtension", null, Sys.UI.IMarkupExtension);


Sys.CollectionChange = function Sys$CollectionChange(action, newItems, newStartingIndex, oldItems, oldStartingIndex) {
    /// <param name="action" type="Sys.NotifyCollectionChangedAction"></param>
    /// <param name="newItems" optional="true" mayBeNull="true"></param>
    /// <param name="newStartingIndex" type="Number" integer="true" optional="true" mayBeNull="true"></param>
    /// <param name="oldItems" optional="true" mayBeNull="true"></param>
    /// <param name="oldStartingIndex" type="Number" integer="true" optional="true" mayBeNull="true"></param>
    /// <field name="action" type="Sys.NotifyCollectionChangedAction"></field>
    /// <field name="newItems" type="Array" mayBeNull="true" elementMayBeNull="true"></field>
    /// <field name="newStartingIndex" type="Number" integer="true"></field>
    /// <field name="oldItems" type="Array" mayBeNull="true" elementMayBeNull="true"></field>
    /// <field name="oldStartingIndex" type="Number" integer="true"></field>
    var e = Function._validateParams(arguments, [
        {name: "action", type: Sys.NotifyCollectionChangedAction},
        {name: "newItems", mayBeNull: true, optional: true},
        {name: "newStartingIndex", type: Number, mayBeNull: true, integer: true, optional: true},
        {name: "oldItems", mayBeNull: true, optional: true},
        {name: "oldStartingIndex", type: Number, mayBeNull: true, integer: true, optional: true}
    ]);
    if (e) throw e;

    this.action = action;
    if (newItems) {
        if (!(newItems instanceof Array)) {
            newItems = [newItems];
        }
    }
    this.newItems = newItems || null;
    if (typeof newStartingIndex !== "number") {
        newStartingIndex = -1;
    }
    this.newStartingIndex = newStartingIndex;
    if (oldItems) {
        if (!(oldItems instanceof Array)) {
            oldItems = [oldItems];
        }
    }
    this.oldItems = oldItems || null;
    if (typeof oldStartingIndex !== "number") {
        oldStartingIndex = -1;
    }
    this.oldStartingIndex = oldStartingIndex;
}
Sys.CollectionChange.registerClass("Sys.CollectionChange");
Sys.NotifyCollectionChangedAction = function Sys$NotifyCollectionChangedAction() {
    /// <field name="add" type="Number" integer="true" static="true"></field>
    /// <field name="remove" type="Number" integer="true" static="true"></field>
    /// <field name="reset" type="Number" integer="true" static="true"></field>
    if (arguments.length !== 0) throw Error.parameterCount();
    throw Error.notImplemented();
}




Sys.NotifyCollectionChangedAction.prototype = {
    add: 0,
    remove: 1,
    reset: 2
}
Sys.NotifyCollectionChangedAction.registerEnum('Sys.NotifyCollectionChangedAction');
Sys.NotifyCollectionChangedEventArgs = function Sys$NotifyCollectionChangedEventArgs(changes) {
    /// <param name="changes" type="Array" elementType="Sys.CollectionChange"></param>
    var e = Function._validateParams(arguments, [
        {name: "changes", type: Array, elementType: Sys.CollectionChange}
    ]);
    if (e) throw e;

    this._changes = changes;
}

    function Sys$NotifyCollectionChangedEventArgs$get_changes() {
    if (arguments.length !== 0) throw Error.parameterCount();
        return this._changes;
    }
Sys.NotifyCollectionChangedEventArgs.prototype = {
    get_changes: Sys$NotifyCollectionChangedEventArgs$get_changes
}
Sys.NotifyCollectionChangedEventArgs.registerClass("Sys.NotifyCollectionChangedEventArgs", Sys.EventArgs);

Sys.Observer = function Sys$Observer() {
    throw Error.invalidOperation();
}
Sys.Observer.registerClass("Sys.Observer");

Sys.Observer.observe = function Sys$Observer$observe(target) {
    /// <param name="target" mayBeNull="false"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"}
    ]);
    if (e) throw e;

    var isArray = target instanceof Array,
        o = Sys.Observer;
    Sys.Observer._ensureObservable(target);
    if (target.setValue === o._observeMethods.setValue) return target;
    o._addMethods(target, o._observeMethods);
    if (isArray) {
        o._addMethods(target, o._arrayMethods);
    }
    return target;
}
Sys.Observer._ensureObservable = function Sys$Observer$_ensureObservable(target) {
    var type = typeof target;
    if ((type === "string") || (type === "number") || (type === "boolean") || (type === "date")) {
        throw Error.invalidOperation(String.format(Sys.TemplateRes.notObservable, type));
    }
}
Sys.Observer._addMethods = function Sys$Observer$_addMethods(target, methods) {
    for (var m in methods) {
        if (target[m] && (target[m] !== methods[m])) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.observableConflict, m));
        }
        target[m] = methods[m];
    }
}
Sys.Observer._addEventHandler = function Sys$Observer$_addEventHandler(target, eventName, handler) {
    Sys.Observer._getContext(target, true).events.addHandler(eventName, handler);
}
Sys.Observer.addEventHandler = function Sys$Observer$addEventHandler(target, eventName, handler) {
    /// <param name="target"></param>
    /// <param name="eventName" type="String"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "eventName", type: String},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._addEventHandler(target, eventName, handler);
}
Sys.Observer._removeEventHandler = function Sys$Observer$_removeEventHandler(target, eventName, handler) {
    Sys.Observer._getContext(target, true).events.removeHandler(eventName, handler);
}
Sys.Observer.removeEventHandler = function Sys$Observer$removeEventHandler(target, eventName, handler) {
    /// <param name="target"></param>
    /// <param name="eventName" type="String"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "eventName", type: String},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._removeEventHandler(target, eventName, handler);
}
Sys.Observer._raiseEvent = function Sys$Observer$_raiseEvent(target, eventName, eventArgs) {
    var ctx = Sys.Observer._getContext(target);
    if (!ctx) return;
    var handler = ctx.events.getHandler(eventName);
    if (handler) {
        handler(target, eventArgs);
    }
}
Sys.Observer.raiseEvent = function Sys$Observer$raiseEvent(target, eventName, eventArgs) {
    /// <param name="target"></param>
    /// <param name="eventName" type="String"></param>
    /// <param name="eventArgs" type="Sys.EventArgs"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "eventName", type: String},
        {name: "eventArgs", type: Sys.EventArgs}
    ]);
    if (e) throw e;

    Sys.Observer._raiseEvent(target, eventName, eventArgs);
}
Sys.Observer.addPropertyChanged = function Sys$Observer$addPropertyChanged(target, handler) {
    /// <param name="target" mayBeNull="false"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._addEventHandler(target, "propertyChanged", handler);
}
Sys.Observer.removePropertyChanged = function Sys$Observer$removePropertyChanged(target, handler) {
    /// <param name="target" mayBeNull="false"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._removeEventHandler(target, "propertyChanged", handler);
}
Sys.Observer._beginUpdate = function Sys$Observer$_beginUpdate(target) {
    Sys.Observer._getContext(target, true).updating = true;
}
Sys.Observer.beginUpdate = function Sys$Observer$beginUpdate(target) {
    /// <param name="target" mayBeNull="false"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._beginUpdate(target);
}
Sys.Observer._endUpdate = function Sys$Observer$_endUpdate(target) {
    var ctx = Sys.Observer._getContext(target);
    if (!ctx || !ctx.updating) return;
    ctx.updating = false;
    var dirty = ctx.dirty;
    ctx.dirty = false;
    if (dirty) {
        if (target instanceof Array) {
            var changes = ctx.changes;
            ctx.changes = null;
            Sys.Observer.raiseCollectionChanged(target, changes);
        }
        Sys.Observer.raisePropertyChanged(target, "");
    }
}
Sys.Observer.endUpdate = function Sys$Observer$endUpdate(target) {
    /// <param name="target" mayBeNull="false"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._endUpdate(target);
}
Sys.Observer._isUpdating = function Sys$Observer$_isUpdating(target) {
    var ctx = Sys.Observer._getContext(target);
    return ctx ? ctx.updating : false;
}
Sys.Observer.isUpdating = function Sys$Observer$isUpdating(target) {
    /// <param name="target" mayBeNull="false"></param>
    /// <returns type="Boolean"></returns>
    var e = Function._validateParams(arguments, [
        {name: "target"}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    return Sys.Observer._isUpdating(target);
}
Sys.Observer._setValue = function Sys$Observer$_setValue(target, propertyName, value) {
    var path = propertyName.split('.');
    for (var i = 0, l = (path.length - 1); i < l ; i++) {
        var name = path[i], getter = target["get_" + name]; 
        if (typeof (getter) === "function") {
            target = getter.call(target);
        }
        else {
            target = target[name];
        }
        var type = typeof (target);
        if ((target === null) || (type === "undefined")) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.nullReferenceInPath, propertyName));
        }
    }    
    var lastPath = path[l], setter = target["set_" + lastPath];
    if (typeof(setter) === 'function') {
        setter.call(target, value);
    }
    else {
        target[lastPath] = value;
    }
    var ctx = Sys.Observer._getContext(target);
    if (ctx && ctx.updating) {
        ctx.dirty = true;
        return;
    };
    Sys.Observer.raisePropertyChanged(target, path[0]);
}
Sys.Observer.setValue = function Sys$Observer$setValue(target, propertyName, value) {
    /// <param name="target" mayBeNull="false"></param>
    /// <param name="propertyName" type="String"></param>
    /// <param name="value" mayBeNull="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "propertyName", type: String},
        {name: "value", mayBeNull: true}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._setValue(target, propertyName, value);
}
Sys.Observer.raisePropertyChanged = function Sys$Observer$raisePropertyChanged(target, propertyName) {
    /// <param name="target" mayBeNull="false"></param>
    /// <param name="propertyName" type="String"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "propertyName", type: String}
    ]);
    if (e) throw e;

    Sys.Observer._ensureObservable(target);
    Sys.Observer._raiseEvent(target, "propertyChanged", new Sys.PropertyChangedEventArgs(propertyName));
}

Sys.Observer.addCollectionChanged = function Sys$Observer$addCollectionChanged(target, handler) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._addEventHandler(target, "collectionChanged", handler);
}
Sys.Observer.removeCollectionChanged = function Sys$Observer$removeCollectionChanged(target, handler) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="handler" type="Function"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "handler", type: Function}
    ]);
    if (e) throw e;

    Sys.Observer._removeEventHandler(target, "collectionChanged", handler);
}
Sys.Observer._collectionChange = function Sys$Observer$_collectionChange(target, change) {
    var ctx = Sys.Observer._getContext(target);
    if (ctx && ctx.updating) {
        ctx.dirty = true;
        var changes = ctx.changes;
        if (!changes) {
            ctx.changes = changes = [change];
        }
        else {
            changes.push(change);
        }
    }
    else {
        Sys.Observer.raiseCollectionChanged(target, [change]);
        Sys.Observer.raisePropertyChanged(target, 'length');
    }
}
Sys.Observer._add = function Sys$Observer$_add(target, item) {
    var change = new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.add, [item], target.length);
    Array.add(target, item);
    Sys.Observer._collectionChange(target, change);
}
Sys.Observer.add = function Sys$Observer$add(target, item) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="item" mayBeNull="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "item", mayBeNull: true}
    ]);
    if (e) throw e;

    Sys.Observer._add(target, item);
}
Sys.Observer._addRange = function Sys$Observer$_addRange(target, items) {
    var change = new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.add, items, target.length);
    Array.addRange(target, items);
    Sys.Observer._collectionChange(target, change);
}
Sys.Observer.addRange = function Sys$Observer$addRange(target, items) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="items" type="Array" elementMayBeNull="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "items", type: Array, elementMayBeNull: true}
    ]);
    if (e) throw e;

    Sys.Observer._addRange(target, items);
}
Sys.Observer._clear = function Sys$Observer$_clear(target) {
    Array.clear(target);
    Sys.Observer._collectionChange(target, new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.reset));
}
Sys.Observer.clear = function Sys$Observer$clear(target) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true}
    ]);
    if (e) throw e;

    Sys.Observer._clear(target);
}
Sys.Observer._insert = function Sys$Observer$_insert(target, index, item) {
    Array.insert(target, index, item);
    Sys.Observer._collectionChange(target, new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.add, [item], index));
}
Sys.Observer.insert = function Sys$Observer$insert(target, index, item) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="index" type="Number" integer="true"></param>
    /// <param name="item" mayBeNull="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "index", type: Number, integer: true},
        {name: "item", mayBeNull: true}
    ]);
    if (e) throw e;

    Sys.Observer._insert(target, index, item);
}
Sys.Observer._remove = function Sys$Observer$_remove(target, item) {
    var index = Array.indexOf(target, item);
    if (index !== -1) {
        Array.remove(target, item);
        Sys.Observer._collectionChange(target, new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.remove, null, -1, [item], index));
        return true;
    }
    return false;
}
Sys.Observer.remove = function Sys$Observer$remove(target, item) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="item" mayBeNull="true"></param>
    /// <returns type="Boolean"></returns>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "item", mayBeNull: true}
    ]);
    if (e) throw e;

    return Sys.Observer._remove(target, item);
}
Sys.Observer._removeAt = function Sys$Observer$_removeAt(target, index) {
    if ((index > -1) && (index < target.length)) {
        var item = target[index];
        Array.removeAt(target, index);
        Sys.Observer._collectionChange(target, new Sys.CollectionChange(Sys.NotifyCollectionChangedAction.remove, null, -1, [item], index));
    }
}
Sys.Observer.removeAt = function Sys$Observer$removeAt(target, index) {
    /// <param name="target" type="Array" elementMayBeNull="true"></param>
    /// <param name="index" type="Number" integer="true"></param>
    var e = Function._validateParams(arguments, [
        {name: "target", type: Array, elementMayBeNull: true},
        {name: "index", type: Number, integer: true}
    ]);
    if (e) throw e;

    Sys.Observer._removeAt(target, index);
}
Sys.Observer.raiseCollectionChanged = function Sys$Observer$raiseCollectionChanged(target, changes) {
    /// <param name="target"></param>
    /// <param name="changes" type="Array" elementType="Sys.CollectionChange"></param>
    var e = Function._validateParams(arguments, [
        {name: "target"},
        {name: "changes", type: Array, elementType: Sys.CollectionChange}
    ]);
    if (e) throw e;

    Sys.Observer._raiseEvent(target, "collectionChanged", new Sys.NotifyCollectionChangedEventArgs(changes));
}

Sys.Observer._observeMethods = {
    add_propertyChanged: function(handler) {
        Sys.Observer._addEventHandler(this, "propertyChanged", handler);
    },
    remove_propertyChanged: function(handler) {
        Sys.Observer._removeEventHandler(this, "propertyChanged", handler);
    },
    addEventHandler: function(eventName, handler) {
        /// <param name="eventName" type="String"></param>
        /// <param name="handler" type="Function"></param>
        var e = Function._validateParams(arguments, [
            {name: "eventName", type: String},
            {name: "handler", type: Function}
        ]);
        if (e) throw e;

        Sys.Observer._addEventHandler(this, eventName, handler);
    },
    removeEventHandler: function(eventName, handler) {
        /// <param name="eventName" type="String"></param>
        /// <param name="handler" type="Function"></param>
        var e = Function._validateParams(arguments, [
            {name: "eventName", type: String},
            {name: "handler", type: Function}
        ]);
        if (e) throw e;

        Sys.Observer._removeEventHandler(this, eventName, handler);
    },
    get_isUpdating: function() {
        /// <returns type="Boolean"></returns>
        if (arguments.length !== 0) throw Error.parameterCount();
        return Sys.Observer._isUpdating(this);
    },
    beginUpdate: function() {
        if (arguments.length !== 0) throw Error.parameterCount();
        Sys.Observer._beginUpdate(this);
    },
    endUpdate: function() {
        if (arguments.length !== 0) throw Error.parameterCount();
        Sys.Observer._endUpdate(this);
    },
    setValue: function(name, value) {
        /// <param name="name" type="String"></param>
        /// <param name="value" mayBeNull="true"></param>
        var e = Function._validateParams(arguments, [
            {name: "name", type: String},
            {name: "value", mayBeNull: true}
        ]);
        if (e) throw e;

        Sys.Observer._setValue(this, name, value);
    },
    raiseEvent: function(eventName, eventArgs) {
        /// <param name="eventName" type="String"></param>
        /// <param name="eventArgs" type="Sys.EventArgs"></param>
        var e = Function._validateParams(arguments, [
            {name: "eventName", type: String},
            {name: "eventArgs", type: Sys.EventArgs}
        ]);
        if (e) throw e;

        Sys.Observer._raiseEvent(this, eventName, eventArgs);
    },
    raisePropertyChanged: function(name) {
        /// <param name="name" type="String"></param>
        var e = Function._validateParams(arguments, [
            {name: "name", type: String}
        ]);
        if (e) throw e;

        Sys.Observer._raiseEvent(this, "propertyChanged", new Sys.PropertyChangedEventArgs(name));
    }
}
Sys.Observer._arrayMethods = {
    add_collectionChanged: function(handler) {
        Sys.Observer._addEventHandler(this, "collectionChanged", handler);
    },
    remove_collectionChanged: function(handler) {
        Sys.Observer._removeEventHandler(this, "collectionChanged", handler);
    },
    add: function(item) {
        /// <param name="item" mayBeNull="true"></param>
        var e = Function._validateParams(arguments, [
            {name: "item", mayBeNull: true}
        ]);
        if (e) throw e;

        Sys.Observer._add(this, item);
    },
    addRange: function(items) {
        /// <param name="items" type="Array" elementMayBeNull="true"></param>
        var e = Function._validateParams(arguments, [
            {name: "items", type: Array, elementMayBeNull: true}
        ]);
        if (e) throw e;

        Sys.Observer._addRange(this, items);
    },
    clear: function() {
        if (arguments.length !== 0) throw Error.parameterCount();
        Sys.Observer._clear(this);
    },
    insert: function(index, item) { 
        /// <param name="index" type="Number" integer="true"></param>
        /// <param name="item" mayBeNull="true"></param>
        var e = Function._validateParams(arguments, [
            {name: "index", type: Number, integer: true},
            {name: "item", mayBeNull: true}
        ]);
        if (e) throw e;

        Sys.Observer._insert(this, index, item);
    },
    remove: function(item) {
        /// <param name="item" mayBeNull="true"></param>
        /// <returns type="Boolean"></returns>
        var e = Function._validateParams(arguments, [
            {name: "item", mayBeNull: true}
        ]);
        if (e) throw e;

        return Sys.Observer._remove(this, item);
    },
    removeAt: function(index) {
        /// <param name="index" type="Number" integer="true"></param>
        var e = Function._validateParams(arguments, [
            {name: "index", type: Number, integer: true}
        ]);
        if (e) throw e;

        Sys.Observer._removeAt(this, index);
    },
    raiseCollectionChanged: function(changes) {
        /// <param name="changes" type="Array" elementType="Sys.CollectionChange"></param>
        var e = Function._validateParams(arguments, [
            {name: "changes", type: Array, elementType: Sys.CollectionChange}
        ]);
        if (e) throw e;

        Sys.Observer._raiseEvent(this, "collectionChanged", new Sys.NotifyCollectionChangedEventArgs(changes));
    }
}
Sys.Observer._getContext = function Sys$Observer$_getContext(obj, create) {
    var ctx = obj._observerContext;
    if (ctx) return ctx();
    if (create) {
        return (obj._observerContext = Sys.Observer._createContext())();
    }
    return null;
}
Sys.Observer._createContext = function Sys$Observer$_createContext() {
                            var ctx = {
        events: new Sys.EventHandlerList()
    };
    return function() {
        return ctx;
    }
}


Sys.BindingMode = function Sys$BindingMode() {
}






Sys.BindingMode.prototype = {
    auto: 0,
    oneTime: 1,
    oneWay: 2,
    twoWay: 3,
    oneWayToSource: 4
}
Sys.BindingMode.registerEnum("Sys.BindingMode");
Sys.Binding = function Sys$Binding() {
    Sys.Binding.initializeBase(this);
}















    function Sys$Binding$get_convert() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._convert || null;
    }
    function Sys$Binding$set_convert(value) {
       this._convert = value;
       this._convertFn = this._resolveFunction(value);
    }
    function Sys$Binding$get_convertBack() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._convertBack || null;
    }
    function Sys$Binding$set_convertBack(value) {
       this._convertBack = value;
       this._convertBackFn = this._resolveFunction(value);
    }
    function Sys$Binding$get_ignoreErrors() {
        /// <value type="Boolean" mayBeNull="false"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._ignoreErrors;
    }
    function Sys$Binding$set_ignoreErrors(value) {
        var e = Function._validateParams(arguments, [{name: "value", type: Boolean}]);
        if (e) throw e;

       this._ignoreErrors = value;
    }
    function Sys$Binding$get_mode() {
        /// <value type="Sys.BindingMode" mayBeNull="false"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._mode;
    }
    function Sys$Binding$set_mode(value) {
        var e = Function._validateParams(arguments, [{name: "value", type: Sys.BindingMode}]);
        if (e) throw e;

        if (this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.bindingUpdateAfterInit, "mode"));
        }
        this._mode = value;
    }
    function Sys$Binding$get_source() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._source || null;
    }
    function Sys$Binding$set_source(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        if (this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.bindingUpdateAfterInit, "source"));
        }
        this._source = value;
    }
    function Sys$Binding$get_path() {
        /// <value type="String" mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._path || "";
    }
    function Sys$Binding$set_path(value) {
        var e = Function._validateParams(arguments, [{name: "value", type: String, mayBeNull: true}]);
        if (e) throw e;

        if (this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.bindingUpdateAfterInit, "path"));
        }
        this._path = value;
        this._pathArray = value ? value.split('.') : null;
    }
    function Sys$Binding$get_target() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._target || null;
    }
    function Sys$Binding$set_target(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        if (this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.bindingUpdateAfterInit, "target"));
        }
        this._target = value;
    }
    function Sys$Binding$get_targetProperty() {
        /// <value type="String" mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._targetProperty || "";
    }
    function Sys$Binding$set_targetProperty(value) {
        var e = Function._validateParams(arguments, [{name: "value", type: String, mayBeNull: true}]);
        if (e) throw e;

        if (this.get_isInitialized()) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.bindingUpdateAfterInit, 
                                                       "targetProperty"));
        }
        this._targetProperty = value;
        this._targetPropertyArray = value ? value.split('.') : null;
    }


    function Sys$Binding$_addBinding(element) {
                        if (element.nodeType === 3) {
                        element = element.parentNode;
                        if (!element) return;
        }
        var bindings = element._msajaxBindings;
        if (!bindings) {
           element._msajaxBindings = [this];
        }
        else {
           bindings.push(this);
        }
                if (typeof(element.dispose) !== "function") {
            element.dispose = Sys.Binding._disposeBindings;
        }
    }
    function Sys$Binding$_disposeHandlers() {
        for (var i = 0, l = this._handlers.length; i < l; i++) {
            var entry = this._handlers[i], object = entry[2];
            switch(entry[0]) {
                case "click":                 case "keyup":                 case "change":                     Sys.UI.DomEvent.removeHandler(object, entry[0], entry[1]);
                    break;
                case "propertyChanged":                                                             if (object.remove_propertyChanged) { 
                        object.remove_propertyChanged(entry[1]);
                    }
                    else {
                        Sys.Observer.removePropertyChanged(object, entry[1]);
                    }
                    break;
                case "disposing":                     object.remove_disposing(entry[1]);
                    break;
            }
        }
    }
    function Sys$Binding$dispose() {
                if(this._handlers) {
            this._disposeHandlers();
            delete this._handlers;
        }
        this._convert = null;
        this._convertBack = null;
        this._convertFn = null;
        this._convertBackFn = null;
        this._source = null;
        this._target = null;
        this._pathArray = null;
        this._targetPropertyArray = null;
        Sys.Binding.callBaseMethod(this, 'dispose');
    }
    function Sys$Binding$_getDefaultMode(target) {
        if (Sys.UI.DomElement.isDomElement(target)) {
            if (target.nodeType === 1) { 
                var tag = target.tagName.toLowerCase(); 
                if ((tag === "input") || (tag === "select") || (tag === "textarea")) {
                    return Sys.BindingMode.twoWay;
                }
            }
        }
        else {
            if (Sys.INotifyPropertyChange.isImplementedBy(target)) { 
                return Sys.BindingMode.twoWay;
            }
        }
        return Sys.BindingMode.oneWay;
    }
    function Sys$Binding$_getPropertyFromIndex(obj, path, index) {
                        for (var i = 0; i <= index; i++) {
            obj = this._getPropertyData(obj, path[i]);
                                                            var type = typeof (obj);
            if ( (i < (path.length - 1)) && ((obj === null) || (type === "undefined"))) {
                throw Error.invalidOperation(String.format(Sys.TemplateRes.nullReferenceInPath, path.join('.')));
            }
        }
        return obj;
    }
    function Sys$Binding$_getPropertyData(obj, name) {
        if (typeof (obj["get_" + name]) === "function") {
            return obj["get_" + name]();
        }
        else {
            return obj[name];
        }
    }
    function Sys$Binding$_hookEvent(object, handlerMethod, componentHandlerMethod) {
                var thisHander;
        if (Sys.UI.DomElement.isDomElement(object)) {
            if (object.nodeType === 1) { 
                thisHandler = Function.createDelegate(this, handlerMethod);
                Array.add(this._handlers, ["propertyChanged", thisHandler, object]);                                                                                        if (object.add_propertyChanged) { 
                    object.add_propertyChanged(thisHandler);
                }
                else {
                    Sys.Observer.addPropertyChanged(object, thisHandler);
                }

                var tag = object.tagName.toLowerCase(); 
                                if ((tag === "input") || (tag === "select") || (tag === "textarea")) {
                    var type = object.type;
                                        if ((tag === "input") && type && 
                        ((type.toLowerCase() === "checkbox") || (type.toLowerCase() === "radio"))) {
                            thisHandler = Function.createDelegate(this, handlerMethod);
                            Array.add(this._handlers, ["click", thisHandler, object]);                             Sys.UI.DomEvent.addHandler(object, "click", thisHandler);
                    }
                                        if(tag === "select") {
                        thisHandler = Function.createDelegate(this, handlerMethod);
                        Array.add(this._handlers, ["keyup", thisHandler, object]);                         Sys.UI.DomEvent.addHandler(object, "keyup", thisHandler);
                    }
                    thisHandler = Function.createDelegate(this, handlerMethod);
                    Array.add(this._handlers, ["change", thisHandler, object]);                     Sys.UI.DomEvent.addHandler(object, "change", thisHandler);
                    this._addBinding(object);
                }
                else {
                    throw Error.invalidOperation(Sys.TemplateRes.bindingNonInputElement);
                }
            }
            else {
                throw Error.invalidOperation(Sys.TemplateRes.bindingNonInputElement);
            }
        }
        else {
                                                thisHandler = Function.createDelegate(this, componentHandlerMethod);
            Array.add(this._handlers, ["propertyChanged", thisHandler, object]);             if (object.add_propertyChanged) { 
                object.add_propertyChanged(thisHandler);
            }
            else {
                Sys.Observer.addPropertyChanged(object, thisHandler);
            }
            
            if (Sys.INotifyDisposing.isImplementedBy(object)) {
                thisHandler = Function.createDelegate(this, this._onDisposing);
                Array.add(this._handlers, ["disposing", thisHandler, object]);                 object.add_disposing(thisHandler);
            }
        }
    }
    function Sys$Binding$_onDisposing() {
                this.dispose();
    }
    function Sys$Binding$_resolveFunction(value) {
        var ret;
        if (typeof(value) === 'function') {             ret = value;
        }
        else {
            if (typeof(value) !== "string") {
                throw Error.invalidOperation(String.format(Sys.TemplateRes.invalidFunctionName, value));
            }
            try {
                ret = Type.parse(value);
            }
            catch (e) {
                throw Error.invalidOperation(String.format(Sys.TemplateRes.functionNotFound, value));
            }
        }
        return ret;
    }
    function Sys$Binding$update(mode) {
        /// <param name="mode" optional="true" mayBeNull="false"></param>
        var e = Function._validateParams(arguments, [
            {name: "mode", optional: true}
        ]);
        if (e) throw e;

                        if (!this.get_isInitialized()) {
            throw Error.invalidOperation(Sys.TemplateRes.updateBeforeInit);
        }
        mode = mode || this.get_mode();
        if (mode === Sys.BindingMode.oneWayToSource) {
            delete this._lastTarget; 
            this._onTargetPropertyChanged();
        }
        else{
            delete this._lastSource;
            this._onSourcePropertyChanged();
        }
    }

    function Sys$Binding$initialize() {
                                var source = this.get_source(), target = this.get_target(), mode = this.get_mode();
        if (this.get_isInitialized()) {
            throw Error.invalidOperation(Sys.TemplateRes.initializeAfterInit);
        }
                var msg = Sys.TemplateRes.bindingPropertyNotSet;
        if (!source) {
            throw Error.invalidOperation(String.format(msg,"source"));
        }
        if (!target) {
            throw Error.invalidOperation(String.format(msg,"target"));
        }
        if (!this.get_path()) {
            throw Error.invalidOperation(String.format(msg,"path"));
        }
        if (!this.get_targetProperty()) {
            throw Error.invalidOperation(String.format(msg,"targetProperty"));
        }
        Sys.Binding.callBaseMethod(this, 'initialize');
        if (mode === Sys.BindingMode.auto) {
            mode = this._getDefaultMode(target);
        }
                this.update(mode);

                this._handlers = [];
        if (mode !== Sys.BindingMode.oneWayToSource) {
            this._hookEvent(source, this._onSourcePropertyChanged, this._onComponentSourceChanged);
        }
        else {
            if (Sys.UI.DomElement.isDomElement(source)) {
                this._addBinding(source);
            }
        }
                if (mode !== Sys.BindingMode.oneWay) {
            this._hookEvent(target, this._onTargetPropertyChanged, this._onComponentTargetChanged);
        }
        else {
            if (Sys.UI.DomElement.isDomElement(target)) {
                this._addBinding(target);
            }
        }
    }
    function Sys$Binding$_onComponentSourceChanged(sender, args) {
        var name = args.get_propertyName();
        if ((name === "") || (name === this._pathArray[0])) {
            this._onSourcePropertyChanged();
        }
    }
    function Sys$Binding$_onComponentTargetChanged(sender, args) {
        var name = args.get_propertyName();
        if ((name === "") || (name ===  this._targetPropertyArray[0])) {
            this._onTargetPropertyChanged();
        }
    }
    function Sys$Binding$_onSourcePropertyChanged() {
                var source = this._getPropertyFromIndex(this.get_source(), this._pathArray, 
                                                this._pathArray.length - 1);
        if (!this._updateSource && (source !== this._lastSource)) {
            try {
                this._updateTarget = true;
                this._lastSource = this._lastTarget = source;
                if (this._convertFn) {
                    if (this._ignoreErrors) {
                        try {
                            source = this._convertFn(source, this);
                        }
                        catch (e) {}
                    }
                    else {
                        source = this._convertFn(source, this);
                    }
                }
                var targetArrayLength = this._targetPropertyArray.length, 
                    target = this._getPropertyFromIndex(this.get_target(), this._targetPropertyArray, 
                                                        targetArrayLength - 2);
                    Sys.Observer.setValue(target, this._targetPropertyArray[targetArrayLength - 1], source);
            }
            finally {
                this._updateTarget = false;
            }
        }
    }
    function Sys$Binding$_onTargetPropertyChanged() {
                var target = this._getPropertyFromIndex(this.get_target(), this._targetPropertyArray, 
                                                this._targetPropertyArray.length - 1);
        if (!this._updateTarget && (target !== this._lastTarget)) {
            try {
                this._updateSource = true;
                this._lastTarget = this._lastSource = target;
                if (this._convertBackFn) {
                    if (this._ignoreErrors) {
                        try {
                            target = this._convertBackFn(target, this);
                        }
                        catch (e) {}
                    }
                    else {
                        target = this._convertBackFn(target, this);
                    }
                }
                var sourceArrayLength = this._pathArray.length,
                    source = this._getPropertyFromIndex(this.get_source(), this._pathArray, 
                                                        sourceArrayLength - 2);
                    Sys.Observer.setValue(source, this._pathArray[sourceArrayLength - 1], target);
            }
            finally {
                this._updateSource = false;
            }
        }
    }
Sys.Binding.prototype = {
    _convert: null,
    _convertBack: null,
    _convertFn: null,
    _convertBackFn: null,
    _handlers: null,
    _ignoreErrors: false,
    _mode: Sys.BindingMode.auto,
    _path: null,
    _targetProperty: null,
    _source: null,
    _target: null,
    _updateSource: false,
    _updateTarget: false,
        get_convert: Sys$Binding$get_convert,
    set_convert: Sys$Binding$set_convert,
    get_convertBack: Sys$Binding$get_convertBack,
    set_convertBack: Sys$Binding$set_convertBack,
    get_ignoreErrors: Sys$Binding$get_ignoreErrors,
    set_ignoreErrors: Sys$Binding$set_ignoreErrors,
    get_mode: Sys$Binding$get_mode,
    set_mode: Sys$Binding$set_mode,
    get_source: Sys$Binding$get_source,
    set_source: Sys$Binding$set_source,
    get_path: Sys$Binding$get_path,
    set_path: Sys$Binding$set_path,
    get_target: Sys$Binding$get_target,
    set_target: Sys$Binding$set_target,
    get_targetProperty: Sys$Binding$get_targetProperty,
    set_targetProperty: Sys$Binding$set_targetProperty,

        _addBinding: Sys$Binding$_addBinding,
    _disposeHandlers: Sys$Binding$_disposeHandlers,
    dispose: Sys$Binding$dispose,
    _getDefaultMode: Sys$Binding$_getDefaultMode,
    _getPropertyFromIndex: Sys$Binding$_getPropertyFromIndex,
    _getPropertyData: Sys$Binding$_getPropertyData,
    _hookEvent: Sys$Binding$_hookEvent,
    _onDisposing: Sys$Binding$_onDisposing,
    _resolveFunction: Sys$Binding$_resolveFunction,
    update: Sys$Binding$update,
        initialize: Sys$Binding$initialize,
    _onComponentSourceChanged: Sys$Binding$_onComponentSourceChanged,
    _onComponentTargetChanged: Sys$Binding$_onComponentTargetChanged,
    _onSourcePropertyChanged: Sys$Binding$_onSourcePropertyChanged,
    _onTargetPropertyChanged: Sys$Binding$_onTargetPropertyChanged
}
Sys.Binding._disposeBindings = function Sys$Binding$_disposeBindings() {
        var bindings = this._msajaxBindings;    
    if (bindings) {
        for(var i = 0, l = bindings.length; i < l; i++) {
            bindings[i].dispose();
        }
    }
    this._msajaxBindings = null;
    
        if (this.control && typeof(this.control.dispose) === "function") {
        this.control.dispose();
    }

    if (this.dispose === Sys.Binding._disposeBindings) {
        this.dispose = null;
    }
}
Sys.Binding.registerClass("Sys.Binding", Sys.Component);

Sys.Application.registerMarkupExtension(
"binding", 
function(component, targetProperty, properties) {
    var mode = properties.mode, convert = properties.convert, 
        convertBack = properties.convertBack, ignoreErrors = properties.ignoreErrors,
        binding = new Sys.Binding();

    if (mode) {
        if (typeof(mode) === "string") {
            mode = Sys.BindingMode.parse(mode);
        }
    }
    else {
        mode = Sys.BindingMode.auto;
    }
    
    binding.set_source(properties.source || properties.$dataItem);
    binding.set_path(properties.path || properties.$default);
    binding.set_target(component);
    binding.set_targetProperty(targetProperty);
    binding.set_mode(mode);

    if(properties.convert) {
        binding.set_convert(properties.convert);
    }
    if(properties.convertBack) {
        binding.set_convertBack(properties.convertBack);
    }
    if (ignoreErrors) {
        if(typeof(ignoreErrors) === "string") {
            ignoreErrors = Boolean.parse(ignoreErrors);
        }
        else {
            ignoreErrors = !!ignoreErrors;
        }
        binding.set_ignoreErrors(ignoreErrors);
    }   
    binding.initialize();
}, 
false);
Sys.UI.DataView = function Sys$UI$DataView(element) {
    /// <param name="element"></param>
    var e = Function._validateParams(arguments, [
        {name: "element"}
    ]);
    if (e) throw e;

    Sys.UI.DataView.initializeBase(this, [element]);
}














    function Sys$UI$DataView$add_itemCreated(handler) {
    var e = Function._validateParams(arguments, [{name: "handler", type: Function}]);
    if (e) throw e;

        this.get_events().addHandler("itemCreated", handler);
    }
    function Sys$UI$DataView$remove_itemCreated(handler) {
    var e = Function._validateParams(arguments, [{name: "handler", type: Function}]);
    if (e) throw e;

        this.get_events().removeHandler("itemCreated", handler);
    }
    function Sys$UI$DataView$get_data() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._data;
    }
    function Sys$UI$DataView$set_data(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        if (!this._setData || (this._data !== value)) {
            this._swapData(this._data, value);
            this._data = value;
            this._dirty = this._setData = true;
            if (this._isActive()) {
                this.raisePropertyChanged("data");
                this._render();
            }
            else {
                this._changed = true;
            }
        }
    }
    function Sys$UI$DataView$get_itemPlaceholder() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._placeholder || null;
    }
    function Sys$UI$DataView$set_itemPlaceholder(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        this._ensureElementOrId(value);
        if (this._placeholder !== value) {
            this._placeholder = value;
            this._dirty = true;
            this._useRemove = false;
            this.raisePropertyChanged("itemPlaceholder");
        }
    }
    function Sys$UI$DataView$get_parentContext() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._parentContext || null;
    }
    function Sys$UI$DataView$set_parentContext(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        if (this._parentContext !== value) {
            this._parentContext = value;
            this._dirty = true;
            this.raisePropertyChanged("parentContext");
        }
    }
    function Sys$UI$DataView$get_template() {
        /// <value mayBeNull="true"></value>
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._template || null;
    }
    function Sys$UI$DataView$set_template(value) {
        var e = Function._validateParams(arguments, [{name: "value", mayBeNull: true}]);
        if (e) throw e;

        if (!Sys.UI.Template.isInstanceOfType(value)) {
            this._ensureElementOrId(value);
        }
        if (this._template !== value) {
            this._template = value;
            this._useRemove = false;
            this._dirty = true;
            if (this._isActive()) {
                this.raisePropertyChanged("template");
                if (this._setData) {
                    this._render();
                }
            }
            else {
                this._changed = true;
            }
        }
    }
    function Sys$UI$DataView$_ensureElementOrId(obj) {
        if (obj && (typeof(obj) !== "string") && !Sys.UI.DomElement.isDomElement(obj)) {
            throw Error.argument("value", Sys.TemplateRes.expectedElementOrId);
        }
    }
    function Sys$UI$DataView$_getTemplate() {
        var template = this.get_template();
        if (!template) return null;
        if (typeof(template) === "string") {
            template = this._resolveElement(template);
        }
                                if (this._dvTemplate && (this._dvTemplate !== template)) {
            this._dvTemplate.dispose();
            this._dvTemplate = null;
        }
        return template;
    }
    function Sys$UI$DataView$_clearElement(e) {
        Sys.Application.disposeElement(e, true);
        if (this._useRemove) {
            this._removeAll(e);
        }
        else {
            try {
                e.innerHTML = "";
            }
            catch (err) {
                                this._removeAll(e);
                this._useRemove = true;
            }
        }
    }
    function Sys$UI$DataView$_collectionChanged() {
        if (this._isActive()) {
            this._render();
        }
        else {
            this._dirty = true;
        }
    }
    function Sys$UI$DataView$_elementContains(container, element) {
        while (element) {
            if (element === container) return true;
            element = element.parentNode;
        }
        return false;
    }
    function Sys$UI$DataView$_removeAll(e) {
        while (e.firstChild) {
            e.removeChild(e.firstChild);
        }
    }
    function Sys$UI$DataView$_resolveElement(id) {
        var el = Sys.UI.DomElement.getElementById(id);
        if (!el) {
            throw Error.invalidOperation(String.format(Sys.TemplateRes.elementNotFound, id));
        }
        return el;
    }
    function Sys$UI$DataView$_getTemplateAndPlaceholder() {
                        var template = this._dvTemplate || this._getTemplate(),
            placeholder = this.get_itemPlaceholder(),
            element = this.get_element();
        if (typeof(placeholder) === "String") {
            placeholder = this._resolveElement(placeholder);
        }
        if (!template) {
            this._dvTemplate = new Sys.UI.Template(element);
            return { template: this._dvTemplate, placeholder: element };
        }
        if (!Sys.UI.Template.isInstanceOfType(template)) {
            this._dvTemplate = template = new Sys.UI.Template(template);
        }
        if (!placeholder) {
                        if (this._elementContains(element, template.get_element())) {
                                placeholder = template.get_element();
            }
            else {
                                                var id = this.get_id();
                if (id) {
                    placeholder = Sys.UI.DomElement.getElementById(id + "_item", this.get_element());
                }
            }
        }
        return { template : template, placeholder: (placeholder || element) };
    }
    function Sys$UI$DataView$_initializeResults() {
        for (var i = 0, l = this._results.length; i < l; i++) {
            this._results[i].initializeComponents();
        }
    }
    function Sys$UI$DataView$_isActive() {
        return (this.get_isInitialized() && !this.get_isUpdating());
    }
    function Sys$UI$DataView$_raiseItemCreated(args) {
        this.onItemCreated(args);
        var handler = this.get_events().getHandler("itemCreated");
        if (handler) {
            handler(this, args);
        }
    }
    function Sys$UI$DataView$_render() {
        this._dirty = false;
        var taph = this._getTemplateAndPlaceholder(),
            template = taph.template,
            placeholder = taph.placeholder,
            data = this.get_data(),
            pctx = this.get_parentContext(),
            result, oldPlaceholder = this._currentPlaceholder;
        this._currentPlaceholder = placeholder;
        if (oldPlaceholder && (oldPlaceholder !== placeholder)) {
                                    this._clearElement(oldPlaceholder);
        }
        if (!template || !placeholder) return;
        var parent = placeholder, element = this.get_element(), isChild = false;
        while (parent) {
            if (parent == element) {
                isChild = true;
                break;
            }
            parent = parent.parentNode;
        }
        if (!isChild) {
            throw Error.invalidOperation(Sys.TemplateRes.misplacedPlaceholder);
        }
                template.compile();
        this._clearElement(placeholder);
        if (template.get_element() === placeholder) {
                                    Sys.UI.DomElement.removeCssClass(placeholder, "sys-template");
        }
        if ((data === null) || (typeof(data) === "undefined")) {
            this._results = [];
        }
        else if (data instanceof Array) {
            var len = data.length;
            this._results = new Array(len);
            for (var i = 0; i < len; i++) {
                var item = data[i];
                result = template.createInstance(placeholder, item, i, pctx);
                this._raiseItemCreated(new Sys.UI.DataViewItemEventArgs(item, result));
                this._results[i] = result;
            }
        }
        else {
            result = template.createInstance(placeholder, data, 0, pctx);
            this.onItemCreated(new Sys.UI.DataViewItemEventArgs(data, result));
            this._results = [result];
        }
        this._initializeResults();
    }
    function Sys$UI$DataView$_swapData(oldData, newData) {
                if (oldData) {
            switch (this._eventType) {
                case 1:
                    oldData.remove_collectionChanged(this._changedHandler);
                    break;
                case 2:
                    Sys.Observer.removeCollectionChanged(oldData, this._changedHandler);
                    break;
            }
        }
                        this._eventType = 0;
        if (newData) {
            if (!this._changedHandler) {
                this._changedHandler = Function.createDelegate(this, this._collectionChanged);
            }
            if (typeof(newData.add_collectionChanged) === "function") {
                newData.add_collectionChanged(this._changedHandler);
                this._eventType = 1;
            }
            else if (newData instanceof Array) {
                Sys.Observer.addCollectionChanged(newData, this._changedHandler);
                this._eventType = 2;
            }
        }
    }
    function Sys$UI$DataView$dispose() {
                if (this._currentPlaceholder && !Sys.Application.get_isDisposing()) {
            Sys.Application.disposeElement(this._currentPlaceholder, true);
        }
        if (this._dvTemplate) {
            this._dvTemplate.dispose();
        }
        this._swapData(this._data, null);
        this._currentPlaceholder = this._placeholder = this._results =
        this._parentContext = this._dvTemplate = this._currentPlaceholder = this._data = null;
        Sys.UI.DataView.callBaseMethod(this, "dispose");
    }
    function Sys$UI$DataView$initialize() {
        if (arguments.length !== 0) throw Error.parameterCount();
        Sys.UI.DataView.callBaseMethod(this, "initialize");
        if (this._setData) {
            this._render();
        }
    }
    function Sys$UI$DataView$onItemCreated(args) {
        /// <param name="args" type="Sys.UI.DataViewItemEventArgs"></param>
        var e = Function._validateParams(arguments, [
            {name: "args", type: Sys.UI.DataViewItemEventArgs}
        ]);
        if (e) throw e;

    }
    function Sys$UI$DataView$updated() {
        if (arguments.length !== 0) throw Error.parameterCount();
        if (this._changed) {
            this.raisePropertyChanged("");
            this._changed = false;
        }
        if (this._dirty && this._setData) {
            this._render();
        }
    }
Sys.UI.DataView.prototype = {
    _data: null,
    _eventType: 0,
    _template: null,
    _dvTemplate: null,
    _parentContext: null,
    _results: null,
    _changed: false,
    _dirty: false,
    _setData: false,
    _currentPlaceholder: null,
        _useRemove: false,
    
    add_itemCreated: Sys$UI$DataView$add_itemCreated,
    remove_itemCreated: Sys$UI$DataView$remove_itemCreated,
    get_data: Sys$UI$DataView$get_data,
    set_data: Sys$UI$DataView$set_data,
    get_itemPlaceholder: Sys$UI$DataView$get_itemPlaceholder,
    set_itemPlaceholder: Sys$UI$DataView$set_itemPlaceholder,
    get_parentContext: Sys$UI$DataView$get_parentContext,
    set_parentContext: Sys$UI$DataView$set_parentContext,    
    get_template: Sys$UI$DataView$get_template,
    set_template: Sys$UI$DataView$set_template,
    _ensureElementOrId: Sys$UI$DataView$_ensureElementOrId,
    _getTemplate: Sys$UI$DataView$_getTemplate,
    _clearElement: Sys$UI$DataView$_clearElement,
    _collectionChanged: Sys$UI$DataView$_collectionChanged,
    _elementContains: Sys$UI$DataView$_elementContains,
    _removeAll: Sys$UI$DataView$_removeAll,
    _resolveElement: Sys$UI$DataView$_resolveElement,
    _getTemplateAndPlaceholder: Sys$UI$DataView$_getTemplateAndPlaceholder,    
    _initializeResults: Sys$UI$DataView$_initializeResults,    
    _isActive: Sys$UI$DataView$_isActive,
    _raiseItemCreated: Sys$UI$DataView$_raiseItemCreated,
    _render: Sys$UI$DataView$_render,
    _swapData: Sys$UI$DataView$_swapData,
    dispose: Sys$UI$DataView$dispose, 
    initialize: Sys$UI$DataView$initialize,
    onItemCreated: Sys$UI$DataView$onItemCreated,
    updated: Sys$UI$DataView$updated    
}
Sys.UI.DataView.registerClass("Sys.UI.DataView", Sys.UI.Control, Sys.UI.ITemplateContext);
Sys.UI.DataViewItemEventArgs = function Sys$UI$DataViewItemEventArgs(dataItem, templateResult) {
    Sys.UI.DataViewItemEventArgs.initializeBase(this);
    this._result = templateResult || null;
    this._data = dataItem || null;
}

    function Sys$UI$DataViewItemEventArgs$get_dataItem() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._data;
    }
    function Sys$UI$DataViewItemEventArgs$get_templateResult() {
        if (arguments.length !== 0) throw Error.parameterCount();
        return this._result;
    }
Sys.UI.DataViewItemEventArgs.prototype = {
    get_dataItem: Sys$UI$DataViewItemEventArgs$get_dataItem,
    get_templateResult: Sys$UI$DataViewItemEventArgs$get_templateResult
}
Sys.UI.DataViewItemEventArgs.registerClass("Sys.UI.DataViewItemEventArgs", Sys.EventArgs);
Sys.TemplateRes = {
    "bindingUpdateAfterInit":"Binding '{0}' cannot be set after initialize.",
    "bindingPropertyNotSet":"Binding '{0}' must be set prior to initialize.",
    "bindingNonInputElement":"Element must be an input, textarea, or select to support two-way data binding.",
    "elementNotFound":"An element with id '{0}' could not be found.",
    "expectedElementOrId":"Value must be a DOM element or DOM element Id.",
    "functionNotFound":"A function with the name '{0}' could not be found.",
    "initializeAfterInit":"Initialize cannot be called more than once.",
    "invalidFunctionName":"'{0}' must be of type Function or the name of a function as a String.",
    "invalidSysAttribute":"Invalid attribute '{0}'.",
    "invalidTypeNamespace":"Invalid type namespace declaration, '{0}' is not a valid type.",
    "invalidAttach":"Invalid attribute '{0}', the type '{1}' is not a registered namespace.",
    "misplacedPlaceholder":"DataView item placeholder must be a child element of the DataView.",
    "updateBeforeInit":"Update cannot be called before initialize.",
    "notObservable":"Instances of type '{0}' cannot be observed.",
    "observableConflict":"Object already contains a member with the name '{0}'.",
    "nullReferenceInPath":"Null reference while evaluating data path: '{0}'.",
    "invalidHandler":"Trying to dispose an invalid handler: '{0}'."
};
Boolean._oldParse = Boolean.parse;
Boolean.parse = function Boolean$parse(value) {
    return Boolean._oldParse(value);
}
Date._oldParse = Date.parse;
Date.parse = function Date$parse(value) {
    return Date._oldParse(value);
}
Number._oldParseLocale = Number.parseLocale;
Number.parseLocale = function Number$parseLocale(value) {
    return Number._oldParseLocale(value);
}
Number._oldParseInvariant = Number.parseInvariant;
Number.parseInvariant = function Number$parseInvariant(value) {
    return Number._oldParseInvariant(value);
}
