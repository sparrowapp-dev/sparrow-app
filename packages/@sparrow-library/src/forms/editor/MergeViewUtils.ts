/**
 * Utilities for working with CodeMirror merge view and navigating changes
 */
import { EditorView } from '@codemirror/view';

/**
 * Represents a change in the merge view
 */
export interface MergeChange {
  from: number;      // Start position in the document
  to: number;        // End position in the document
  type: 'added' | 'removed';  // Type of change
  element: Element;  // DOM element representing the change
  elements?: Element[];  // All DOM elements in this group
}

/**
 * Find all changes in a merge view editor
 * This searches for added and removed content markers in the DOM
 */
export function findMergeViewChanges(editorView: EditorView): MergeChange[] {
  if (!editorView || !editorView.dom) {
    console.error('EditorView or its DOM is not available');
    return [];
  }

  const changes: MergeChange[] = [];
  const changeElements = {
    added: Array.from(editorView.dom.querySelectorAll('.cm-changedLine')),
    removed: Array.from(editorView.dom.querySelectorAll('.cm-deletedChunk'))
  };

  // Process added changes
  changeElements.added.forEach(element => {
    const lineElement = element.closest('.cm-line');
    if (!lineElement) return;

    const startPos = editorView.posAtDOM(element);
    const endPos = startPos + element.textContent?.length || 0;

    changes.push({
      from: startPos,
      to: endPos,
      type: 'added',
      element
    });
  });

  // Process removed changes
  changeElements.removed.forEach(element => {
    // const lineElement = element.closest('.cm-line');
    // if (!lineElement) return;

    const startPos = editorView.posAtDOM(element);
    const endPos = startPos + element.textContent?.length || 0;

    changes.push({
      from: startPos,
      to: endPos,
      type: 'removed',
      element
    });
  });

  // Sort changes by their position in the document
  return changes.sort((a, b) => a.from - b.from);
}

/**
 * Highlight a specific change in the merge view
 */
export function highlightChange(change: MergeChange): void {

  // First, hide all chunkButtons
  document.querySelectorAll('.cm-deletedChunk .cm-chunkButtons').forEach(el => {
    (el as HTMLElement).style.display = 'none';
    (el as HTMLElement).style.visibility = 'hidden';
  });


  // Remove existing highlight from all changes
  // document.querySelectorAll('.cm-merge-highlighted-change').forEach(el => {
  //   el.classList.remove('cm-merge-highlighted-change');
  // });

  // Add highlight to the current change
  //   change.element.classList.add('cm-merge-highlighted-change');

  // If we have a group of elements, highlight all of them

  if (change.elements && change.elements.length > 0) {
    change.elements.forEach(element => {
      // element.classList.add('cm-merge-highlighted-change');

      // Make chunkButtons visible for the current element if it's a deletedChunk
      if (element.classList.contains('cm-deletedChunk')) {
        const chunkButtons = element.querySelector('.cm-chunkButtons');
        if (chunkButtons) {
          (chunkButtons as HTMLElement).style.display = 'flex';
          (chunkButtons as HTMLElement).style.visibility = 'visible';
        }
      }

    });
  }
  else {
    // Otherwise, just highlight the main element
    // change.element.classList.add('cm-merge-highlighted-change');

    // Make chunkButtons visible for the current element if it's a deletedChunk
    if (change.element.classList.contains('cm-deletedChunk')) {
      const chunkButtons = change.element.querySelector('.cm-chunkButtons');
      if (chunkButtons) {
        (chunkButtons as HTMLElement).style.display = 'flex';
        (chunkButtons as HTMLElement).style.visibility = 'visible';
      }
    }

  }
}

/**
 * Scroll to a specific change in the editor
 */
export function scrollToChange(editorView: EditorView, change: MergeChange): void {
  if (!editorView || !change) return;

  // Use CodeMirror's scrollIntoView to scroll to the change position
  editorView.dispatch({
    effects: EditorView.scrollIntoView(change.from, {
      y: 'center' // Center the change vertically in the viewport
    })
  });

  highlightChange(change); // Highlight the change visually
}

/**
 * Group changes that are on the same line or adjacent lines
 * This helps prevent counting every small change as a separate navigation point
 */
export function groupChanges(changes: MergeChange[], editorView: EditorView): MergeChange[] {
  if (!changes.length || !editorView) return changes;

  const groupedChanges: MergeChange[] = [];
  let currentGroup: MergeChange | null = null;

  for (const change of changes) {
    // If we don't have a current group or this change is far from the current group
    if (!currentGroup ||
      (editorView.lineBlockAt(change.from).from - editorView.lineBlockAt(currentGroup.to).to >= 1)) {
      // Start a new group
      //   currentGroup = { ...change };
      currentGroup = {
        ...change,
        elements: [change.element] // Initialize elements array with the current element
      };
      groupedChanges.push(currentGroup);
    } else {
      // Extend the current group
      currentGroup.to = Math.max(currentGroup.to, change.to);
      // Keep the 'added' type if any change in the group is 'added'
      if (change.type === 'added') {
        currentGroup.type = 'added';
      }

      // Add this element to the group's elements collection
      if (!currentGroup.elements) {
        currentGroup.elements = [currentGroup.element];
      }
      currentGroup.elements.push(change.element);
    }
  }

  return groupedChanges;
}

/**
 * Get the text content of a change
 */
export function getChangeContent(editorView: EditorView, change: MergeChange): string {
  if (!editorView || !change) return '';
  return editorView.state.doc.sliceString(change.from, change.to);
}

/**
 * Setup keyboard shortcuts for navigating between changes
 */
export function setupChangeNavigation(
  editorView: EditorView,
  onNext: () => void,
  onPrevious: () => void
): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Use Alt+Up/Down as keyboard shortcuts
    if (event.altKey) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        onNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        onPrevious();
      }
    }
  };

  // Add event listener
  editorView.dom.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    editorView.dom.removeEventListener('keydown', handleKeyDown);
  };
}