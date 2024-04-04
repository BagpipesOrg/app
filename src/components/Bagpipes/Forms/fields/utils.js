
export const getCaretPosition = (editableDivRef) => {
    const editableDiv = editableDivRef.current;
    if (!editableDiv) {
        return 0;
      }
    let caretPos = 0;
    if (window.getSelection && editableDiv) {
      const range = window.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editableDiv);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretPos = preCaretRange.toString().length;
    }
    return caretPos;
  };
  
  export const setCaretPosition = (editableDivRef, caretPos) => {
    const editableDiv = editableDivRef.current;
    if (!editableDiv || !window.getSelection) {
      return;
    }
  
    const setPos = (node, pos) => {
      const range = document.createRange();
      const sel = window.getSelection();
  
      range.setStart(node, pos);
      range.collapse(true);
  
      sel.removeAllRanges();
      sel.addRange(range);
    }
  
    let currentPos = 0;
    let nodeFound = false;
  
    const searchNode = (node, pos) => {
      if (!node || nodeFound) {
        return;
      }
  
      // If the node is a text node and the position is within this node
      if (node.nodeType === Node.TEXT_NODE) {
        if (currentPos + node.length >= pos) {
          setPos(node, pos - currentPos);
          nodeFound = true;
          return;
        }
        currentPos += node.length;
      }
  
      // If the node is an element node, traverse its children
      if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          searchNode(node.childNodes[i], pos);
          if (nodeFound) {
            break;
          }
        }
      }
    };
  
    searchNode(editableDiv, caretPos);
  };
  

  export const updateCombinedValue = (editableDiv, onChange) => {
    if (!editableDiv) return;
  
    let combinedValue = '';
    Array.from(editableDiv.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // For text nodes, add the text content to the combined value
        combinedValue += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE && node.className === 'pill') {
        // For pill elements, create an HTML representation
        const pillId = node.getAttribute('data-id');
        const pillText = node.textContent;
        const pillColor = node.style.backgroundColor;
        const nodeIndex = node.getAttribute('data-nodeindex');
        combinedValue += `<span draggable="true" contenteditable="false" class="pill" data-id="${pillId}" data-text="${pillText}" data-nodeindex="${nodeIndex}" style="background-color: ${pillColor};"> ${pillText}</span>`;
      }
    });
    console.log("CustomInput 4. combinedValue:", combinedValue);
  
    // Update the state or prop that tracks the combined value
    onChange(combinedValue);
  };


  const getNodeSize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // For text nodes, estimate size. This is an approximation.
      // One approach is to create a temporary element, add the text, and measure it.
      let tempDiv = document.createElement('div');
      tempDiv.style.display = 'inline-block';
      tempDiv.textContent = node.textContent;
      document.body.appendChild(tempDiv);
      let size = { width: tempDiv.offsetWidth, height: tempDiv.offsetHeight };
      document.body.removeChild(tempDiv);
      return size;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // For element nodes (like pills), use their actual size.
      console.log("CustomNode Node type and size:", node.nodeType, { width: node.offsetWidth, height: node.offsetHeight });
  
      return { width: node.offsetWidth, height: node.offsetHeight };
    }
  
    return { width: 0, height: 0 };
  };
  
  
const calculateIndexFromPosition = (editableDiv, position) => {
    let childNodes = editableDiv.childNodes;
    let accumulatedOffset = 0;
    
    for (let i = 0; i < childNodes.length; i++) {
      let node = childNodes[i];
      let nodeSize = getNodeSize(node); // Function to calculate the size of the node
      console.log("CustomInput 1. calculating middle point");
      // Calculate middle point of the node for more accurate positioning
      let middlePoint = accumulatedOffset + nodeSize.width / 2;
  
    if (position.x <= middlePoint) {
        // Determine if the drop is closer to the previous node or this node
        if (i > 0 && position.x < accumulatedOffset - getNodeSize(editableDiv.childNodes[i - 1]).width / 2) {
          return i - 1;  // Drop between the previous node and this node
        }
        return i; // Drop before this node
      }
      
      accumulatedOffset += nodeSize.width;
    }
  
    return childNodes.length; // If not found, insert at the end
  };
  
  
  const calculateIndexFromCaretPosition = (editableDiv, caretPos) => {
    let cumulativeLength = 0;
    
    for (let i = 0; i < editableDiv.childNodes.length; i++) {
      let node = editableDiv.childNodes[i];
      let nodeLength = node.nodeType === Node.TEXT_NODE ? node.textContent.length : 1; // Assuming a pill counts as one character
  
      if (cumulativeLength + nodeLength >= caretPos) {
        return i; // Insert at this index
      }
  
      cumulativeLength += nodeLength;
    }
  
    return editableDiv.childNodes.length; // Insert at the end if not found
  };
  
  
  const createPillElement = (pill, handleDragStart, handleDragEnd,removePill) => {
    let pillElement = document.createElement('span');
    pillElement.setAttribute('data-id', pill.id);
    pillElement.textContent = `${pill.nodeIndex}. ${pill.text}`;    
    console.log("CustomInput 1. text content:", pill.text);
    pillElement.className = 'pill';
    pillElement.style.backgroundColor = pill.color;
    pillElement.setAttribute('contenteditable', 'false');
    pillElement.setAttribute('data-nodeindex', pill.nodeIndex);
    pillElement.draggable = true;
    pillElement.addEventListener('click', () => removePill(pill.id));
    pillElement.draggable = true;
    pillElement.addEventListener('dragstart', handleDragStart);
    pillElement.addEventListener('dragend', handleDragEnd);
    console.log("CustomInput 1. created pill element", pillElement);

    return pillElement;
  };
  
  export const insertPillAtPosition = (editableInputRef, pill, dropCoordinates, onChange, handleDragStart, handleDragEnd, removePill) => {
      const editableDiv = editableInputRef.current;
      if (!editableDiv) return;
    
      let index;
      if (dropCoordinates) {
        index = calculateIndexFromPosition(editableDiv, dropCoordinates);
      } else {
      // If dropCoordinates aren't provided, use the caret position
      const caretPos = getCaretPosition(editableInputRef);
      index = calculateIndexFromCaretPosition(editableDiv, caretPos);
    }
    
    let pillElement = createPillElement(pill, handleDragStart, handleDragEnd, removePill);
    
    if (editableDiv.childNodes[index]) {
      editableDiv.insertBefore(pillElement, editableDiv.childNodes[index]);
    } else {
      editableDiv.appendChild(pillElement);
  }
  console.log("CustomInput 1. inserted pill element", pillElement);
    updateCombinedValue(editableDiv, onChange); // Update the combined value
  };
  

  export function parseInputField(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const textNodes = [];
    const pills = [];
  
    // Extract text nodes
    doc.body.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        textNodes.push(node.textContent.trim());
      }
    });
  
    // Extract pill elements
    const pillElements = doc.querySelectorAll('.pill');
    pillElements.forEach(pill => {
      const id = pill.getAttribute('data-id');
      const nodeIndex = pill.getAttribute('data-nodeindex');
      const text = pill.textContent.trim().replace(/^\d+\.\s*/, ''); // Remove the nodeIndex prefix
      const color = pill.style.backgroundColor; // Assuming you want to capture the color as well
  
      pills.push({ id, nodeIndex, text, color });
    });
  
    return {
      text: textNodes.join(' '), // Combine all text nodes into a single string
      pills
    };
  }

  

  function parseValueToVisualPills(value, pills, setEditableContent) {
    let visualContent = ''; // Initialize the visual content as an empty string
  
    // Logic to parse and transform pills into visual HTML elements
    pills.forEach((pill) => {
      // For each pill, create a visual representation
      const pillHtml = `<span class="pill" contenteditable="false" style="background-color: ${pill.color};" data-id="${pill.id}" data-nodeindex="${pill.nodeIndex}">${pill.nodeIndex}. ${pill.text}</span>`;
      visualContent += pillHtml; // Append the pill HTML to the visual content
    });
  
    // Set the editable content with the newly formed visual representation
    setEditableContent(visualContent);
  }