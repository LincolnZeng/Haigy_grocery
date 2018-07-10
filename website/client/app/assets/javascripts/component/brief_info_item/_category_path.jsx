modulejs.define("component/brief_info_item/_category_path", [
  "react",
  "app/navigator",
  "app/constant"
], function(React, navigator, constant) {
  "use strict";


  const BriefinfoitemCategorypathComponent = React.createClass({
    propTypes: {
      categoryPath: React.PropTypes.array,
      linkLastCategory: React.PropTypes.bool
    },


    getDefaultProps() {
      return {
        linkLastCategory: false
      };
    },


    render() {
      if (this.props.categoryPath) {
        var categoryPath = this.props.categoryPath;
        var categoryPathLength = categoryPath.length;
        var categoryButtonClass = "ui mini circular button";
        var categoryButtonWrapperClass = "haigy-display-inline-block haigy-padding-b-10px";

        var content = null;
        if (categoryPathLength > 0) {
          var lastCategoryIndex = categoryPathLength - 1;
          var lastCategoryId = categoryPath[lastCategoryIndex].id;
          var lastCategoryName = categoryPath[lastCategoryIndex].name;

          var categoryPathContent = [];
          for (var index = 0; index < lastCategoryIndex; ++index) {
            var categoryId = categoryPath[index].id;
            categoryPathContent.push(<span className={categoryButtonWrapperClass} key={categoryId}><a className={categoryButtonClass} href={navigator.briefinfoitemBrowseHash(categoryId)}>{categoryPath[index].name}</a></span>);
          }

          if (this.props.linkLastCategory) {
            categoryPathContent.push(<span className={categoryButtonWrapperClass} key={lastCategoryId}><a className={categoryButtonClass} href={navigator.briefinfoitemBrowseHash(lastCategoryId)}>{lastCategoryName}</a></span>);
          } else {
            categoryPathContent.push(<span className={categoryButtonWrapperClass} key="last"><button className={categoryButtonClass} disabled>{lastCategoryName}</button></span>);
          }

          content = (
            <span className="haigy-padding-l-30px">
              {categoryPathContent}
            </span>
          );
        } else {
          content = (
            <span className="haigy-padding-l-30px">
              <span className={categoryButtonWrapperClass}>
                <a className={categoryButtonClass} href={navigator.briefinfoitemBrowseHash(constant.item.ROOT_PARENT_CATEGORY_ITEM_ID)}>
                  Home
                </a>
              </span>
            </span>
          );
        }

        return (
          <div className="haigy-padding-r-30px haigy-padding-b-10px haigy-font-italic">
            <span className="haigy-padding-b-10px">
              <button className="ui tiny circular labeled icon basic button" onClick={this.goBack}>
                <i className="arrow left icon"></i>
                Back
              </button>
            </span>
            {content}
          </div>
        );
      } else {
        return null;
      }
    },


    goBack: function(event) {
      event.preventDefault();
      event.currentTarget.blur();
      navigator.back();
    }
  });


  return BriefinfoitemCategorypathComponent;
});
