"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var TrixEditor = (function (_super) {
    __extends(TrixEditor, _super);
    function TrixEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.container = null;
        _this.editor = null;
        _this.d = null;
        _this.id = _this.generateId();
        _this.state = {
            showMergeTags: false,
            tags: [],
        };
        return _this;
    }
    TrixEditor.prototype.generateId = function () {
        var dt = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return "T" + uuid;
    };
    TrixEditor.prototype.componentDidMount = function () {
        var _this = this;
        var props = this.props;
        this.container = document.getElementById("editor-" + this.id);
        if (this.container) {
            this.container.addEventListener("trix-initialize", function () {
                _this.editor = _this.container.editor;
                if (!_this.editor) {
                    console.error("cannot  find trix editor");
                }
                if (props.onEditorReady && typeof props.onEditorReady == "function") {
                    props.onEditorReady(_this.editor);
                }
            }, false);
            this.container.addEventListener("trix-change", this.handleChange.bind(this), false);
            if (props.uploadURL) {
                this.container.addEventListener("trix-attachment-add", this.handleUpload.bind(this));
            }
        }
        else {
            console.error("editor not found");
        }
    };
    TrixEditor.prototype.componentWillUnmount = function () {
        this.container.removeEventListener("trix-initialize", this.handleChange);
        this.container.removeEventListener("trix-change", this.handleChange);
        if (this.props.uploadURL) {
            this.container.removeEventListener("trix-attachment-add", this.handleUpload);
        }
    };
    TrixEditor.prototype.frequencyOfChar = function (word, char) {
        var e_1, _a;
        var count = 0;
        try {
            for (var word_1 = __values(word), word_1_1 = word_1.next(); !word_1_1.done; word_1_1 = word_1.next()) {
                var c = word_1_1.value;
                if (c === char)
                    ++count;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (word_1_1 && !word_1_1.done && (_a = word_1.return)) _a.call(word_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return count;
    };
    TrixEditor.prototype.frequencyOfWord = function (text, word) {
        return (text.match(new RegExp(word, "g")) || []).length;
    };
    TrixEditor.prototype.countTriggersInText = function (text) {
        var _this = this;
        var triggers = __spread(new Set(this.props.mergeTags.map(function (mt) { return mt.trigger; })));
        return triggers.reduce(function (count, t) { return count + _this.frequencyOfChar(text, t); }, 0);
    };
    TrixEditor.prototype.countTagsInText = function (text) {
        var _this = this;
        var countTagsOfMergeTag = function (tags) {
            return tags.reduce(function (count, _a) {
                var tag = _a.tag;
                return count + _this.frequencyOfWord(text, tag);
            }, 0);
        };
        return this.props.mergeTags.reduce(function (count, _a) {
            var tags = _a.tags;
            return count + countTagsOfMergeTag(tags);
        }, 0);
    };
    TrixEditor.prototype.handleChange = function (e) {
        var props = this.props;
        var state = this.state;
        var text = e.target.innerText;
        if (props.onChange) {
            props.onChange(e.target.innerHTML, text);
        }
        var range = this.editor.getSelectedRange();
        if (text && range[0] == range[1]) {
            if (props.mergeTags) {
                var lastChar = range[0] - 1;
                if (lastChar >= 0 && lastChar < text.length) {
                    var trigger = text[lastChar];
                    for (var i = 0; i < props.mergeTags.length; i++) {
                        if (trigger == props.mergeTags[i].trigger) {
                            state.showMergeTags = true;
                            state.tags = props.mergeTags[i].tags;
                            this.setState(state);
                            break;
                        }
                    }
                }
            }
        }
        if (state.showMergeTags) {
            if (this.countTriggersInText(text) === this.countTagsInText(text)) {
                state.showMergeTags = false;
                state.tags = [];
                this.setState(state);
            }
        }
    };
    TrixEditor.prototype.handleUpload = function (e) {
        var attachment = e.attachment;
        if (attachment.file) {
            return this.uploadAttachment(attachment);
        }
    };
    TrixEditor.prototype.uploadAttachment = function (attachment) {
        var file, form, xhr;
        file = attachment.file;
        form = new FormData();
        if (this.props.uploadData) {
            for (var k in this.props.uploadData) {
                form.append(k, this.props.uploadData[k]);
            }
        }
        form.append(this.props.fileParamName || "file", file);
        xhr = new XMLHttpRequest();
        xhr.open("POST", this.props.uploadURL, true);
        xhr.upload.onprogress = function (event) {
            var progress = (event.loaded / event.total) * 100;
            return attachment.setUploadProgress(progress);
        };
        xhr.onload = function () {
            var href, url;
            if (xhr.status >= 200 && xhr.status < 300) {
                url = href = xhr.responseText;
                return attachment.setAttributes({
                    url: url,
                    href: href,
                });
            }
        };
        return xhr.send(form);
    };
    TrixEditor.prototype.handleTagSelected = function (t, e) {
        e.preventDefault();
        var state = this.state;
        state.showMergeTags = false;
        this.setState(state);
        this.editor.expandSelectionInDirection("backward");
        this.editor.insertString(t.tag);
    };
    TrixEditor.prototype.renderTagSelector = function (tags) {
        var _this = this;
        if (!tags) {
            return null;
        }
        var editorPosition = document
            .getElementById("trix-editor-top-level")
            .getBoundingClientRect();
        var rect = this.editor.getClientRectAtPosition(this.editor.getSelectedRange()[0]);
        if (!rect) {
            return null;
        }
        var boxStyle = {
            position: "absolute",
            zIndex: 1001,
            top: rect.top + 25 - editorPosition.top,
            left: rect.left + 25 - editorPosition.left,
            width: "250px",
            boxSizing: "border-box",
            padding: 0,
            margin: ".2em 0 0",
            backgroundColor: "hsla(0,0%,100%,.9)",
            borderRadius: ".3em",
            background: "linear-gradient(to bottom right, white, hsla(0,0%,100%,.8))",
            border: "1px solid rgba(0,0,0,.3)",
            boxShadow: ".05em .2em .6em rgba(0,0,0,.2)",
            textShadow: "none",
        };
        var tagStyle = {
            display: "block",
            padding: ".2em .5em",
            cursor: "pointer",
        };
        return (React.createElement("div", { style: boxStyle, className: "react-trix-suggestions" }, tags.map(function (t) {
            return (React.createElement("a", { key: t.name, style: tagStyle, href: "#", onClick: _this.handleTagSelected.bind(_this, t) }, t.name));
        })));
    };
    TrixEditor.prototype.render = function () {
        var _this = this;
        var state = this.state;
        var props = this.props;
        var attributes = {
            id: "editor-" + this.id,
            input: "input-" + this.id,
        };
        if (props.className) {
            attributes["class"] = props.className;
        }
        if (props.autoFocus) {
            attributes["autoFocus"] = props.autoFocus.toString();
        }
        if (props.placeholder) {
            attributes["placeholder"] = props.placeholder;
        }
        if (props.toolbar) {
            attributes["toolbar"] = props.toolbar;
        }
        var mergetags = null;
        if (state.showMergeTags) {
            mergetags = this.renderTagSelector(state.tags);
        }
        return (React.createElement("div", { id: "trix-editor-top-level", ref: function (d) { return (_this.d = d); }, style: { position: "relative" } },
            React.createElement("trix-editor", attributes),
            React.createElement("input", { type: "hidden", id: "input-" + this.id, value: this.props.value }),
            mergetags));
    };
    return TrixEditor;
}(React.Component));
exports.TrixEditor = TrixEditor;
//# sourceMappingURL=react-trix.js.map