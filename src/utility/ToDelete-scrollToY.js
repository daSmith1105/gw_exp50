const scrollToY = ( y, scrollView ) => {
  scrollView.scrollTo({ x: 0, y: y || 0 });
};

export default scrollToY;