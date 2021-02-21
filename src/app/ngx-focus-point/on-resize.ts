export class OnResize {
  private animationFrameHandle;
  readonly resizeEventName = 'resize';
  readonly sizeCacheKey = 'currentSize';

  constructor(public elements: Array<HTMLElement>) {
    this.start();
  }

  public stop() {
    try {
      window.cancelAnimationFrame(this.animationFrameHandle);
    } catch (e) {
      clearInterval(this.animationFrameHandle);
    }
  }

  public start(skipStop = false) {
    try {
      if (!skipStop) {
        this.stop();
      }
      this.elements
        .filter((element) => isElementInViewport(element))
        .forEach((element) => {
          const previousSize = getDataFromElement(element, this.sizeCacheKey);
          const currentSize = getSizeFromElement(element);

          if (previousSize && checkSizeDiff(currentSize, previousSize)) {
            element.dispatchEvent(
              new CustomEvent(this.resizeEventName, {
                detail: currentSize,
              }),
            );
          }
          setDataInElement(element, this.sizeCacheKey, currentSize);
        });
      if (isWindowAvailable()) {
        this.animationFrameHandle = requestAnimationFrame(() => this.start(true));
      } else {
        this.animationFrameHandle = setTimeout(() => this.start(true), 1000 / 60);
      }
    } catch (e) {

    }

  }
}

// all helper functions below - Can be re-used for the next classes

const isWindowAvailable = () => {
  try {
    if (window === undefined) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const isElementInViewport = (element: HTMLElement) => {
  try {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
    const vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
    const horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;
    return vertInView && horInView;
  } catch (e) {
    return true;
  }
};

const setDataInElement = (element: HTMLElement, key: string, value: any) => {
  element.dataset[key] = JSON.stringify(value);
};

const getDataFromElement = (element: HTMLElement, key: string): any | undefined => {
  return element.dataset[key] ? JSON.parse(element.dataset[key]) : undefined;
};

const checkSizeDiff = (size1: Size, size2: Size) => {
  return size1?.width !== size2?.width || size1?.height !== size2?.height;
};

const getSizeFromElement = (element: HTMLElement): Size => {
  try {
    const computedStyles = window.getComputedStyle(element);
    return {
      width: parseInt(computedStyles.width, 10),
      height: parseInt(computedStyles.height, 10),
    };
  } catch (e) {
    return {
      width: 0,
      height: 0,
    };
  }

};

interface Size {
  width: number;
  height: number;
}
