import React, { Component } from 'react';
import './FeaturePicker.css';

const json = require('./FeaturesEndpointResponse.json');

class FeaturePicker extends Component {

  constructor(props) {
    super(props);

    let expandedCategories = [];

    // ideally, parsing of data would be done in the parent, rather than here (since it's a presenter, really)
    let data = json.data;
    data.featureCategories.sort((a, b) => a.sortOrder > b.sortOrder);
    data.sortedFeatures = {};

    // since each feature has one category and the data is static
    for (let category of data.featureCategories) {
      expandedCategories.push(false);
      data.sortedFeatures[category.sid.id] = data.features.filter((feature) => {
        return feature.categorySid.id === category.sid.id;
      });
    }

    this.state = {
      data: data,
      search: 'mud',
      expandedCategories: expandedCategories
    };
  }

  static defaultProps = {};

  onSearchChange = (evt) => {
    let value = evt.target.value;
    let expandedCategories = [];
    
    // ideally this would be done on a per-category basis depending on how many results are found for each
    //   for a prototype, this works well enough
    for (let expanded of this.state.expandedCategories) {
      if (value.length > 0) {
        expandedCategories.push(true);
      } else {
        expandedCategories.push(false);
      }
    }
    
    this.setState({
      search: value,
      expandedCategories: expandedCategories
    })
  }

  categoryExpansion = (categoryIndex, categoryState) => {
    let expandedCategories = this.state.expandedCategories;
    expandedCategories[categoryIndex] = categoryState;
    this.setState({
      expandedCategories: expandedCategories
    });
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

  renderCategory = (category, categoryIndex) => {
    let features = this.renderFeatures(category.sid.id);

    if (features.length) {
      return (
        <div className="category-section">
          <span className="category-name" onClick={() => this.categoryExpansion(categoryIndex, !this.state.expandedCategories[categoryIndex])}>[+] {category.name} {features.length}</span>
          { this.state.expandedCategories[categoryIndex] ? <div className="category-features">{features}</div> : null }
        </div>
      );
    }

    return null;
  }

  renderCategories = () => {
    return (<div>
      {this.state.data.featureCategories.map((category, c) => {
        return (
          <div key={c}>
            {this.renderCategory(category, c)}
          </div>)
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
        onChange={this.onSearchChange}
      />

      <h3>Feature Categories</h3>
      {this.renderCategories()}
    </div>);
  }
}

export default FeaturePicker;
