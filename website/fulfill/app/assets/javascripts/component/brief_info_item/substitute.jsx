modulejs.define("component/brief_info_item/substitute", [
  "logger",
  "react",
  "material_ui",
  "app/precompiled_asset",
  "app/utility",
  "app/cached_request",
  "app/navigator",
  "app/error_handler",
  "helper/cart",
  "model/detailed_info_item",
  "collection/brief_info_item/substitute",
  "component/main/_loading"
], function(logger, React, MaterialUi, precompiledAsset, utility,
  cachedRequest, navigator, errorHandler, cartHelper, detailedinfoitemModel,
  briefinfoitemSubstituteCollection, MainLoadingComponent
) {
  "use strict";


  const TEXT_SAVE = "SAVE";
  const TEXT_SAVING = "SAVING";
  const TEXT_SAVED = "SAVED";


  const BriefinfoitemSubstituteComponent = React.createClass({
    propTypes: {
      options: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      })
    },


    getInitialState() {
      return {
        pageLoading: true,
        lookupLoading: false,
        item: null,
        lookupCategoryId: null,
        lookupKeywords: "",
        substituteItems: null,
        testButtonDisabled: false,
        saveButtonDisabled: true,
        saveButtonText: TEXT_SAVE
      };
    },


    render() {
      var itemDetails = null;
      var lookupResults = null;

      if (this.state.pageLoading === true) {
        itemDetails = <MainLoadingComponent />;
      } else {
        var item = this.state.item;
        if (item.id && !item.get("is_category")) {
          const RaisedButton = MaterialUi.RaisedButton;
          const TextField = MaterialUi.TextField;
          const RadioButton = MaterialUi.RadioButton;
          const RadioButtonGroup = MaterialUi.RadioButtonGroup;

          var itemSizeInfo = null;
          if (item.get("has_fixed_item_size") ===  true) {
            itemSizeInfo = <div>{item.get("item_size")}</div>;
          } else {
            itemSizeInfo = <div>Item doesn't have a fixed size.</div>;
          }

          var itemStoreInfo = item.get("store_item_info");
          var itemPriceInfo = null;
          if (itemStoreInfo) {
            itemPriceInfo = (
              <div className="meta">
                <div className="cinema">
                  ~ ${parseFloat(itemStoreInfo.price).toFixed(2)} {item.get("unit")}
                </div>
              </div>
            );
          }

          var categories = item.get("category_path");
          var categoryCount = categories.length;
          var categoryOptions = [];
          for (var index = categoryCount - 1; index > 0; --index) {
            categoryOptions.push(
              <RadioButton
                key={index}
                className="haigy-padding-b-5px"
                value={categories[index].id.toString()}
                label={categories[index].name}
              />
            );
          }

          itemDetails = (
            <div className="haigy-width-100-percent haigy-text-align-center">
              <div className="haigy-display-inline-block haigy-width-100-percent haigy-width-max-800px haigy-text-align-left">
                <h2>Set Item Substitutes</h2>
                <div><a href={navigator.cartManageHash}>Back to Cart</a></div><br />
                <div className="ui items"><div className="item">
                  <a className="ui small image haigy-position-relative" href={navigator.detailedinfoitemShowHash(item.id)}>
                    <img className="haigy-image-overlay" src={utility.imagePathToUrl(item.get("cover_image_path"))} alt="Item image" />
                    <img className="haigy-image-loader" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
                  </a>
                  <div className="content">
                    <a className="header" href={navigator.detailedinfoitemShowHash(item.id)}>
                      {item.get("name")}
                    </a>
                    <div className="meta">
                      <div className="cinema">
                        {itemSizeInfo}
                      </div>
                    </div>
                    {itemPriceInfo}
                    <div className="extra">
                      <br />
                      <div>Substitute Lookup Category</div>
                      <div>
                        <RadioButtonGroup name="itemCategory" valueSelected={this.state.lookupCategoryId} onChange={this.onCategoryChange}>
                          {categoryOptions}
                        </RadioButtonGroup>
                      </div>
                      <br />
                      <div>Substitute Lookup Keywords</div>
                      <div>
                        <TextField
                          hintText="no keywords"
                          type="text" value={this.state.lookupKeywords}
                          onChange={this.onLookupKeywordsChange}
                          multiLine={true} rows={1}
                        />
                      </div>
                      <br />
                      <div>
                        <span>
                          <RaisedButton label="Test" secondary={true} disabled={this.state.testButtonDisabled} onTouchTap={this.testLookup} />
                        </span>
                        <span className="haigy-padding-l-20px">
                          <RaisedButton label={this.state.saveButtonText} primary={true} disabled={this.state.saveButtonDisabled} onTouchTap={this.saveSubstituteLookup} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div></div>
              </div>
            </div>
          );

          if (this.state.lookupLoading) {
            lookupResults = <MainLoadingComponent />;
          } else {
            if (this.state.substituteItems) {
              if (this.state.substituteItems.length > 0) {
                var itemCards = this.state.substituteItems.map(function(item) {
                  var storeItemInfo = item.get("store_item_info");
                  var priceInfo = null;
                  if (storeItemInfo) {
                    priceInfo = (
                      <div className="description">
                        ~ ${parseFloat(storeItemInfo.price).toFixed(2)} {item.get("unit")}
                      </div>
                    );
                  }

                  var itemSizeInfo = null;
                  if (item.get("has_fixed_item_size") ===  true) {
                    itemSizeInfo = item.get("item_size");
                  } else {
                    itemSizeInfo = "size varies";
                  }

                  return (
                    <div key={item.id} className="card biitem-small-screen-card-width biitem-wide-screen-card-width">
                      <a className="image haigy-position-relative" href={navigator.detailedinfoitemShowHash(item.id)}>
                        <img className="haigy-image-overlay" src={utility.imagePathToUrl(item.get("cover_image_path"))} alt="Item image" />
                        <img className="haigy-image-loader" src={precompiledAsset.image.IMAGE_LOADER} alt="Loading ..." />
                      </a>
                      <div className="content">
                        {priceInfo}
                        <div className="meta"><i>{itemSizeInfo}</i></div>
                        <div className="description">
                          <a href={navigator.detailedinfoitemShowHash(item.id)}>{item.get("name")}</a>
                        </div>
                      </div>
                    </div>
                  );
                });

                lookupResults  = (
                  <div className="ui centered cards">
                    {itemCards}
                  </div>
                );
              } else {
                lookupResults = <div className="haigy-width-100-percent haigy-text-align-center">No substitue item is found.</div>;
              }
            } else {
              lookupResults = <div className="haigy-width-100-percent haigy-text-align-center">Please click "Test" button to see look up results.</div>;
            }
          }
        } else {
          itemDetails = <div>Sorry, cannot find the item ...</div>;
        }
      }

      return (
        <div>
          {itemDetails}
          <br /><br /><br />
          {lookupResults}
        </div>
      );
    },


    getItemData(itemId) {
      var that = this;
      var zipCode = cartHelper.getZipCode();

      cachedRequest.fetchModel(detailedinfoitemModel, itemId, {
        fetchParameters: {zip_code: zipCode},

        success: function(fetchedItem) {
          var itemSubstituteLookup = utility.lib.itemSubstitute.parseLookupString(fetchedItem.get("substitute_lookup"));
          var lookupCategoryId = itemSubstituteLookup.categoryId;
          if (!lookupCategoryId) {
            var categories = fetchedItem.get("category_path");
            if (categories && categories.length > 0) {
              lookupCategoryId = categories[categories.length - 1].id.toString();
            } else {
              lookupCategoryId = "";
            }
          }

          that.setState({
            pageLoading: false,
            item: fetchedItem,
            lookupCategoryId: lookupCategoryId,
            lookupKeywords: (itemSubstituteLookup.keyword || "")
          });
        },

        error: function(model, jqXHR) {
          logger(that);
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
        }
      });
    },


    componentWillMount() {
      this.getItemData(this.props.options.id);
    },


    componentWillReceiveProps(nextProps) {
      this.setState(this.getInitialState());
      this.getItemData(nextProps.options.id);
    },


    onCategoryChange(event, selectedCategoryId) {
      this.setState({
        lookupCategoryId: selectedCategoryId,
        substituteItems: null,
        saveButtonText: TEXT_SAVE,
        saveButtonDisabled: true
      });
    },


    onLookupKeywordsChange(event) {
      this.setState({
        lookupKeywords: event.currentTarget.value,
        substituteItems: null,
        saveButtonText: TEXT_SAVE,
        saveButtonDisabled: true
      });
    },


    testLookup() {
      var that = this;

      that.setState({
        lookupLoading: true,
        testButtonDisabled: true,
        saveButtonText: TEXT_SAVE,
        saveButtonDisabled: true
      });

      cachedRequest.fetchCollection(briefinfoitemSubstituteCollection, {
        categoryId: that.state.lookupCategoryId,
        keyword: that.state.lookupKeywords.trim()
      }, {
        success: function(fetchedCollection) {
          that.setState({
            lookupLoading: false,
            substituteItems: fetchedCollection.models,
            testButtonDisabled: false,
            saveButtonDisabled: (fetchedCollection.length === 0)
          });
        },

        error: function(collection, jqXHR) {
          logger(that);
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, jqXHR.responseJSON.error_message);
          that.setState(that.getInitialState());
        }
      });
    },


    saveSubstituteLookup() {
      var that = this;
      that.setState({
        testButtonDisabled: true,
        saveButtonText: TEXT_SAVING,
        saveButtonDisabled: true
      });

      var lookupCategoryName = "";
      var lookupCategoryId = that.state.lookupCategoryId;
      var itemCategories = that.state.item.get("category_path");
      var categoryCount = itemCategories.length;
      for (var index = 1; index < categoryCount; ++index) {
        if (lookupCategoryId === itemCategories[index].id.toString()) {
          lookupCategoryName = itemCategories[index].name;
          break;
        }
      }
      var substituteLookup = utility.lib.itemSubstitute.generateLookupString(
        lookupCategoryId, lookupCategoryName, that.state.lookupKeywords
      );

      cachedRequest.saveModel(detailedinfoitemModel, {
        id: this.props.options.id,
        substitute_lookup: substituteLookup,
        zip_code: cartHelper.getZipCode()
      }, {
        success: function(savedItem) {
          cartHelper.updateItemSubstituteLookup(savedItem.id, savedItem.get("substitute_lookup"));
          that.setState({saveButtonText: TEXT_SAVED, testButtonDisabled: false, saveButtonDisabled: true});
        },

        error: function(model, jqXHR) {
          logger(that);
          logger(jqXHR);
          errorHandler(jqXHR.responseJSON.error_code, ["[component/cart/manage/main] - ", jqXHR.responseJSON.error_message].join(""));
          that.setState(that.getInitialState());
        }
      });
    }
  });


  return BriefinfoitemSubstituteComponent;
});