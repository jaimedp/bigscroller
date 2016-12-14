// const React = window.React;

const InfListItem = (props) => {
  return (<div data-index={props.index}>{props.children}</div>);
}

const initSizes = (children, minRowHeight) => children.map(() => minRowHeight);
const makePrefixArray = (arr, avg) => arr.reduce((prev, el, i) => {
  const a = (el) => el >= 0 ? el : avg;
  prev[i] = i === 0 ? a(el) : prev[i-1] + a(el);
  return prev;
}, new Array(arr.length));

const makeReversePrefix = (arr, avg) => makePrefixArray(arr.reverse(), avg);

class InfList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visibleStart: 0,
      visibleEnd: 0,
      sizes: initSizes(props.children, -1),
      prefix: makePrefixArray(props.children, this.props.minRowHeight)
    };

    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.measureElements();
    this.computeVisibleItems();
    this.shouldScroll = true;
  }

  componentWillUpdate() {
    this.scrollHeight = this._div.scrollHeight;
    this.scrollTop = this._div.scrollTop;
  }

  componentDidUpdate() {
    this.measureElements();
    // if (this.props.flip) {
      this.scrollIntoView();
      this.adjustScrollPos();
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const minRowHeight = nextProps.minRowHeight || this.props.minRowHeight;
      this.shouldScroll = true;
      this.setState({prefix: initPrefix(nextProps.children, minRowHeight)})
    }
  }

  measureElements() {
    const elements = this._div.querySelectorAll('.inner-scroller > *:not(.spacer)');
    const knownSizes = [].map.call(elements, (el, i) => {
      const index = Number(el.getAttribute('data-index'));
      // don't access the height prop of the element if we don't have to, sice that causes
      // a re-flow in the rendering engine
      // const height = this.state.sizes[index] >= 0 ? this.state.sizes[index] : el.getBoundingClientRect().height;
      const height = el.getBoundingClientRect().height;
      return {
        height,
        index
      };
    });

    const sizes = knownSizes.reduce((prev, s, i) => {
      prev[s.index] = s.height;
      return prev;
    }, this.state.sizes);
  }

  adjustScrollPos() {
    if (this.prevScrollHeight !== this._div.scrollHeight) {
      this._div.scrollTop = this.scrollTop + (this._div.scrollHeight - this.scrollHeight);
    //   const delta = this._div.scrollHeight- this.prevScrollHeight;
      this.prevScrollHeight = this._div.scrollHeight;
      this.scrollAdjustment = true;
    //   this._div.scrollTop += delta;
    //   console.log('adjusting pos by ', delta);

      console.log('scroll adjusted')
    }
  }

  computeVisibleItems() {
    // let count = 0;
    // const sum = (this.state.sizes.reduce((a, el) => {
    //   if (el >= 0) {
    //     count++;
    //     a += el;
    //   }
    //   return a;
    // }, 0));

    // const avg = count > 0 ? sum / count : this.props.minRowHeight;

    // console.log('avg', avg);

    // debugger;
    let lastRowIndex, lastRowPos;
    let firstIndex;
    let firstRowPos;
    let visibleRows;
    let totalHeight;
    let totalRows = this.state.sizes.length;
    let scrollHeight;
    const prefix = makePrefixArray(this.state.sizes, this.props.minRowHeight);
    if (true || this.props.flip) {
      const reversePrefix = makeReversePrefix(this.state.sizes.slice(), this.props.minRowHeight);

      const visibleHeight = this._div.clientHeight;
      const top = this._div.scrollHeight - this._div.scrollTop - visibleHeight;
      const bottom = top + visibleHeight;

      firstIndex = 0;
      lastRowIndex = 0; //totalRows - 1;
      while (reversePrefix[firstIndex] < top) firstIndex++;
      while (reversePrefix[lastRowIndex] < bottom) lastRowIndex++;

      const tmp = lastRowIndex;
      lastRowIndex = Math.min(totalRows - firstIndex - 1, totalRows - 1);
      firstIndex = Math.max(0, totalRows - tmp - 1);

      totalHeight = prefix[prefix.length - 1];







    } else {
      const visibleHeight = this._div.clientHeight; //this.clientHeight;
      const top = this._div.scrollTop;
      const bottom = top + visibleHeight;
      scrollHeight = this._div.scrollHeight;

      firstIndex = 0;
      while (prefix[firstIndex] < top) firstIndex++;

      visibleRows = 0;
      while (prefix[firstIndex + visibleRows] < top + visibleHeight) visibleRows++;
      lastRowIndex = Math.min(firstIndex + visibleRows, prefix.length-1);
      lastRowPos = prefix[lastRowIndex];

      totalHeight = prefix[prefix.length - 1];
      firstRowPos = firstIndex ? prefix[firstIndex] : 0

    }


    const buffer = 1;

    const visibleStart = Math.max(0, firstIndex);
    const visibleEnd = Math.min(totalRows - 1, lastRowIndex);

    firstRowPos = firstIndex ? prefix[firstIndex] : 0
    lastRowPos = prefix[lastRowIndex];



    const removedFromTop = firstRowPos;
    const removedFromBottom = totalHeight - lastRowPos;

    this.setState({
      initialoffset: this._div.scrollTop,
      visibleRows: visibleRows,
      visibleStart: visibleStart,
      visibleEnd: visibleEnd,

      displayStart: visibleStart, // Math.max(0, Math.floor(visibleStart - visibleRows * 1.5)),
      displayEnd: visibleEnd, // Math.min(prefix.length, visibleEnd * 2),

      offsetTop: removedFromTop,
      offsetBottom: removedFromBottom,
      totalHeight: totalHeight,
      clientHeight: scrollHeight
    });
  }

  scrollIntoView() {
    if (this.shouldScroll) {
      const domNode = this._div;
      setTimeout(() => {
        domNode.scrollTop =  Number.MAX_SAFE_INTEGER;
      }, 0)
      this.shouldScroll = false;
    }
  }

  onScroll(e) {
    this.currentScrollTop = this._div.scrollTop
    if (!this.scrollAdjustment) {
      window.requestAnimationFrame(() => {
        this.clientHeight = this._div.clientHeight;
        this.computeVisibleItems();
      });
      // this.computeVisibleItems();
    } else {
      this.scrollAdjustment = false;
    }
    // console.log(this._div.scrollTop);
  }

  render() {
    let visible = [];

    for (let j=this.state.displayStart; j<=this.state.displayEnd; j++) {
      visible.push(<InfListItem index={j} key={j}>{this.props.children[j]}</InfListItem>);
    }

    const debugInfo = (
      <ul>
        {Object.keys(this.state).map((key, i) => <li key={i}>{key}: {this.state[key]}</li>)}
        <li>Total items: {this.props.children.length}</li>
        <li>Items rendered: {visible.length}</li>
      </ul>
    );


    return (
      <div>
        <div className="outer-scroller" style={this.props.style} onScroll={this.onScroll} ref={(e) => this._div = e}>
          <div className="inner-scroller">
            <div className="spacer top" style={{height: this.state.offsetTop}}></div>
            {visible}
            <div className="spacer bottom"style={{height: this.state.offsetBottom}}></div>
          </div>
        </div>
        {debugInfo}
        <button onClick={() => this._div.scrollTop--}>less</button>
        <button onClick={() => this._div.scrollTop++}>more</button>
      </div>
    );
  }
}

InfList.propTypes = {
  minRowHeight: React.PropTypes.number,
  flip: React.PropTypes.bool
};

InfList.defaultProps = {
  minRowHeight: 60,
  flip: true
};

class Main extends React.Component {
  render() {
    const el = new Array(500).fill(true).map((__, i) => {
      const h = Math.random() * 100 + 25 + 'px';
      const style = {height: h, borderBottom: 'solid 1px red', backgroundColor: i % 2 === 0 ? 'red' : 'green'};
      return <div style={style} key={i}>{i}</div>;
    });

    const style = {
      marginTop: 0,
      overflow: 'auto',
      height: 200,
      border: 'solid 1px blue',
      transform: 'translateZ(0)'
    };

      // <InfList>{el}</InfList>
    return (
      <InfList style={style}>
        {el}
      </InfList>
    );
  }
}


ReactDOM.render(<Main />, document.getElementById('container'));

