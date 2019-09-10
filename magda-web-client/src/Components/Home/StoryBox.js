import React, { Component } from "react";
import MarkdownViewer from "Components/Common/MarkdownViewer";
import "./StoryBox.scss";

class StoryBox extends Component {
    getClickableElement(el, url, label) {
        if (!url) return el;
        return (
            <a
                target="_blank"
                rel="noopener noreferrer"
                href={url}
                className="story-title-link"
                aria-label={label}
            >
                {el}
            </a>
        );
    }

    renderStoryboxBody() {
        const { story } = this.props;
        if (!story) return null;
        const { content, image } = story;
        if (!content) return null;
        const innerBody = (
            <div className="story-box-body">
                {image
                    ? this.getClickableElement(
                          <div>
                              <img
                                  className="story-title-image"
                                  src={`${image}`}
                                  alt=""
                                  aria-hidden="true"
                              />
                              {content.title ? (
                                  <h2
                                      className="story-title"
                                      aria-hidden="true"
                                  >
                                      {content.title}
                                  </h2>
                              ) : null}
                          </div>,
                          content.titleUrl,
                          content.title || `Link to ${content.titleUrl}`
                      )
                    : null}
                <div className="story-box-text">
                    <MarkdownViewer markdown={content.content} />
                </div>
            </div>
        );
        return innerBody;
    }

    getStoryBoxClassName() {
        const classNames = ["story-box"];
        if (this.props.className && typeof this.props.className === "string")
            classNames.push(this.props.className);
        return classNames.join(" ");
    }

    render() {
        return (
            <div className={this.getStoryBoxClassName()}>
                {this.renderStoryboxBody()}
            </div>
        );
    }
}

export default StoryBox;
