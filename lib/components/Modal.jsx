var React = require('react');
var ReactDOM = require('react-dom');
var PropTypes = require('prop-types');
var CreateReactClass = require('create-react-class');
var ExecutionEnvironment = require('exenv');
var ModalPortal = React.createFactory(require('./ModalPortal'));
var ariaAppHider = require('../helpers/ariaAppHider');
var elementClass = require('element-class');
var renderSubtreeIntoContainer = require("react-dom").unstable_renderSubtreeIntoContainer;
var Assign = require('lodash.assign');

var SafeHTMLElement = ExecutionEnvironment.canUseDOM ? window.HTMLElement : {};
var AppElement = ExecutionEnvironment.canUseDOM ? document.body : {appendChild: function() {}};

var Modal = CreateReactClass({

  displayName: 'Modal',
  statics: {
    setAppElement: function(element) {
        AppElement = ariaAppHider.setElement(element);
    },
    injectCSS: function() {
      "production" !== process.env.NODE_ENV
        && console.warn('React-Modal: injectCSS has been deprecated ' +
                        'and no longer has any effect. It will be removed in a later version');
    }
  },

  propTypes: {
    isOpen: PropTypes.bool.isRequired,
    style: PropTypes.shape({
      content: PropTypes.object,
      overlay: PropTypes.object
    }),
    appElement: PropTypes.instanceOf(SafeHTMLElement),
    onAfterOpen: PropTypes.func,
    onRequestClose: PropTypes.func,
    closeTimeoutMS: PropTypes.number,
    ariaHideApp: PropTypes.bool,
    shouldCloseOnOverlayClick: PropTypes.bool,
    name: PropTypes.string
  },

  getDefaultProps: function () {
    return {
      isOpen: false,
      ariaHideApp: true,
      closeTimeoutMS: 0,
      shouldCloseOnOverlayClick: true,
      name: ''
    };
  },

  componentDidMount: function() {
    this.node = document.createElement('div');
    this.node.className = 'ReactModalPortal';
    document.body.appendChild(this.node);
    this.renderPortal(this.props);
  },

  componentWillReceiveProps: function(newProps) {
      if (newProps.isOpen && !this.props.isOpen) {
          document.body.removeChild(this.node)
          document.body.appendChild(this.node)
      }
      this.renderPortal(newProps);
  },

  componentWillUnmount: function() {
    ReactDOM.unmountComponentAtNode(this.node);
    document.body.removeChild(this.node);
    elementClass(document.body).remove('ReactModal__Body--open'+this.props.name);
  },

  renderPortal: function(props) {
    if (props.isOpen) {
      elementClass(document.body).add('ReactModal__Body--open'+this.props.name);
      // document.body.appendChild(this.node)

    } else {
      elementClass(document.body).remove('ReactModal__Body--open'+this.props.name);
      // document.body.removeChild(this.node)
    }

    if (props.ariaHideApp) {
      ariaAppHider.toggle(props.isOpen, props.appElement);
    }

    this.portal = renderSubtreeIntoContainer(this, ModalPortal(Assign({}, props, {defaultStyles: Modal.defaultStyles, name: this.props.name })), this.node);
  },

  render: function () {
    return React.DOM.noscript();
  }
});

Modal.defaultStyles = {
  overlay: {
    position        : 'fixed',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(255, 255, 255, 0.75)'
  },
  content: {
    position                : 'absolute',
    top                     : '0px',
    left                    : '0px',
    right                   : '0px',
    bottom                  : '0px',
    border                  : '1px solid #ccc',
    background              : '#fff',
    overflow                : 'auto',
    WebkitOverflowScrolling : 'touch',
    borderRadius            : '4px',
    outline                 : 'none',
    padding                 : '20px'
  }
}

module.exports = Modal
