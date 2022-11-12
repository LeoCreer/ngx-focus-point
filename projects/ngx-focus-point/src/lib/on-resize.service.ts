import { ApplicationRef, Injectable } from '@angular/core';
import { first } from 'rxjs/operators';

interface Size {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root',
})
export class OnResizeService {
  private animationFrameHandle;
  readonly resizeEventName = 'resize';
  readonly sizeCacheKey = 'currentSize';
  public elements: Array<HTMLElement>;
  constructor(private app: ApplicationRef) {}

  public onResize(htmlElements: Array<HTMLElement>): Array<HTMLElement> {
    this.elements = htmlElements;
    this.start();
    return this.elements;
  }

  public start(skipStop = false) {
    try {
      if (!skipStop) {
        this.stop();
      }
      this.elements
        .filter((element) => this.isElementInViewport(element))
        .forEach((element) => {
          // console.log(element.parentElement)
          const previousSize = this.getDataFromElement(element, this.sizeCacheKey);
          const currentSize = this.getSizeFromElement(element);
          // const parentPreviousSize = this.getDataFromElement(element.parentElement, this.sizeCacheKey);
          // const parentCurrentSize = this.getSizeFromElement(element);
          if (previousSize && this.checkSizeDiff(currentSize, previousSize)) {
            element.dispatchEvent(
              new CustomEvent(this.resizeEventName, {
                detail: currentSize,
              }),
            );
          }

          this.setDataInElement(element, this.sizeCacheKey, currentSize);
        });

      this.app.isStable.pipe(first((isStable) => isStable === true)).subscribe((isStable) => {
        if (isStable) {
          if (this.isWindowAvailable()) {
            this.animationFrameHandle = requestAnimationFrame(() => this.start(true));
          } else {
            this.animationFrameHandle = setTimeout(() => this.start(true), 1000 / 60);
          }
        } else {
          this.stop();
        }
      });
    } catch (e) {}
  }

  public isWindowAvailable() {
    try {
      if (window === undefined) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  public stop() {
    try {
      window.cancelAnimationFrame(this.animationFrameHandle);
    } catch (e) {
      clearInterval(this.animationFrameHandle);
    }
  }

  public isElementInViewport(element: HTMLElement) {
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
  }

  public setDataInElement(element: HTMLElement, key: string, value: any) {
    element.dataset[key] = JSON.stringify(value);
  }

  public getDataFromElement(element: HTMLElement, key: string): any | undefined {
    return element.dataset[key] ? JSON.parse(element.dataset[key]) : undefined;
  }

  public checkSizeDiff(size1: Size, size2: Size) {
    return size1?.width !== size2?.width || size1?.height !== size2?.height;
  }

  public getSizeFromElement(element: HTMLElement): Size {
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
  }
}
