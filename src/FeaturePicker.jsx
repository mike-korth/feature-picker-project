import React, { Component } from 'react';
import './FeaturePicker.css';

const json = require('./FeaturesEndpointResponse.json');

class FeaturePicker extends Component {

  constructor(props) {
    super(props);

    // ideally, parsing of data would be done in the parent, rather than here (since it's a presenter, really)
    let data = json.data;
    data.featureCategories.sort((a, b) => a.sortOrder > b.sortOrder);
    data.sortedFeatures = {};
    for (let category of data.featureCategories) {
      data.sortedFeatures[category.sid.id] = data.features.filter((feature) => {
        return feature.categorySid.id === category.sid.id;
      });
    }

    this.state = {
      data: data,
      search: 'mud'
    };
  }

  static defaultProps = {};

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.state.search !== nextState.search;
  }

  click = (evt) => {
    if (this.props.disabled) return;

    this.props.onClick(evt);
  }

  onChange = (evt) => {
    this.setState({
      search: evt.target.value
    })
  }

  highlightText = (text, regexp) => {
    let highlightSplit = text.split(regexp);
    let highlighted = [];
    highlightSplit.map((text, t) => {
      highlighted.push(text);
      if (t < highlightSplit.length - 1) {
        highlighted.push(<span style={{backgroundColor: 'yellow'}}>{this.state.search}</span>);
      }
    });

    return highlighted;
  }

  renderFeatures = (categorySid) => {
    let features = [];

    let regexp = new RegExp(this.state.search, 'gi');
    let shouldMatch = this.state.search.length > 0;

    for (let feature of this.state.data.sortedFeatures[categorySid]) {
      let isNameMatch = false;
      let keywordMatches = [];

      if (shouldMatch) {
        isNameMatch = feature.displayName.match(regexp) !== null;
        keywordMatches = feature.epKeywords.filter((keyword) => {
          return keyword.match(regexp);
        });
      } else {
        isNameMatch = true;
      }

      let keywordList = keywordMatches.join(', ');
      if (shouldMatch) {
        keywordList = this.highlightText(keywordList, regexp);
      }
      let keyWordDisplay = keywordMatches.length ? <small><br/>Matched keywords: {keywordList}</small> : null;

      let displayName = this.highlightText(feature.displayName, regexp);

      if (isNameMatch || keywordMatches.length) {
        features.push(<div className="feature-section">{displayName} {keyWordDisplay}</div>);
      }
    }

    return features;
  }

  renderCategory = (category) => {
    let features = this.renderFeatures(category.sid.id);

    if (features.length) {
      return (
        <div className="category-section">
          <span className="category-name">[+] {category.name} {features.length}</span>
          <div className="category-features">{features}</div>
        </div>
      );
    }

    return null;
  }

  renderCategories = () => {
    return (<div>
      {this.state.data.featureCategories.map((category, c) => {
        return (<div key={c}>{this.renderCategory(category)}</div>)
      })}
    </div>);
  }

  render = () => {
    return(
    <div className="feature-picker">

      <label>Feature Filter</label>
      <input 
        type="text"
        value={this.state.search}
        onChange={this.onChange}
      />

      <h3>Feature Categories</h3>
      {this.renderCategories()}
    </div>);
  }
}

export default FeaturePicker;
