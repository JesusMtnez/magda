import "./Tooltip.css";

import React from "react";

/**
 * @description Return a information tooltip, on hover show calculation method.
 * @returns { div }
 */
class Tooltip extends React.Component {
    state = {
        offset: 0,
        clickedOutside: false
    };

    constructor(props) {
        super(props);

        this.rootRef = React.createRef();
        this.tooltipTextElementRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
        this.adjustOffset();
    }

    componentDidUpdate() {
        this.adjustOffset();
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside);
    }

    handleClickOutside = event => {
        if (!this.rootRef.current.contains(event.target)) {
            this.setState({ clickedOutside: true });
        }
    };

    /**
     * Adjust the offset margin of the tooltiptext so it's at the centre of the launcher.
     */
    adjustOffset() {
        const tooltipTextElement = this.tooltipTextElementRef.current;
        const rootElement = this.rootRef.current;

        // Why .firstChild? Because we can't attach a ref to a render prop unless whatever's passed in passes the ref through to its first dom element
        const launcherElement = rootElement.firstChild;

        const launcherElementStyle =
            launcherElement.currentStyle ||
            window.getComputedStyle(launcherElement);

        const offset =
            (tooltipTextElement.offsetWidth +
                parseFloat(launcherElementStyle.marginLeft) +
                parseFloat(launcherElementStyle.marginRight) -
                parseFloat(launcherElementStyle.paddingRight) -
                parseFloat(launcherElementStyle.paddingLeft)) /
            2;

        if (this.state.offset !== offset) {
            this.setState({
                offset
            });
        }
    }

    render() {
        const className = this.props.className ? this.props.className : "";
        const openClass =
            this.props.startOpen && !this.state.clickedOutside
                ? "tooltip-open"
                : "";

        return (
            <div
                ref={this.rootRef}
                className={`tooltip ${className} ${openClass}`}
            >
                {/* Caution: if this is ever not the first element be sure to fix adjustOffset */}
                {this.props.launcher && <this.props.launcher />}
                <span
                    className="tooltiptext"
                    ref={this.tooltipTextElementRef}
                    style={{ marginLeft: "-" + this.state.offset + "px" }}
                >
                    {this.props.children}
                </span>
            </div>
        );
    }
}

export default Tooltip;
