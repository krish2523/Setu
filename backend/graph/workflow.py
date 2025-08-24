from typing import Dict, Any
from langgraph.graph import StateGraph, END
from models.schemas import GraphState
from nodes import analyze_image_node, classify_image_node


class ImageClassificationGraph:
    """
    LangGraph workflow for image classification with analysis and severity scoring.
    """
    
    def __init__(self):
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        
        # Create the state graph
        workflow = StateGraph(GraphState)
        
        # Add nodes
        workflow.add_node("analyze", analyze_image_node)
        workflow.add_node("classify", classify_image_node)
        workflow.add_node("format_output", self._format_output_node)
        
        # Define the flow
        workflow.set_entry_point("analyze")
        workflow.add_edge("analyze", "classify")
        workflow.add_edge("classify", "format_output")
        workflow.add_edge("format_output", END)
        
        # Compile the graph
        return workflow.compile()
    
    def _format_output_node(self, state: GraphState) -> GraphState:
        """
        Final node that formats the output as minimal JSON response.
        All detailed analysis is kept in backend for precision.
        """
        try:
            if state.error:
                # Return minimal error response
                result = {
                    "category": "reject",
                    "severity": None,
                    "severity_level": None,
                    "scale": None
                }
            elif state.classification:
                # Return only the essential four fields
                result = {
                    "category": state.classification.category,
                    "severity": state.classification.severity,
                    "severity_level": state.classification.severity_level,
                    "scale": state.classification.scale
                }
            else:
                # Fallback for unexpected state
                result = {
                    "category": "reject",
                    "severity": None,
                    "severity_level": None,
                    "scale": None
                }
            
            # Store formatted result in state (minimal output)
            state.formatted_result = result
            
            # Keep all detailed data in backend for accuracy
            # This includes: confidence, reasoning, analysis details, etc.
            # These are still available in state.classification and state.analysis
            # but are not exposed in the final output
            
            return state
            
        except Exception as e:
            state.error = f"Error formatting output: {str(e)}"
            state.formatted_result = {
                "category": "reject",
                "severity": None,
                "severity_level": None,
                "scale": None
            }
            return state
    
    def process_image(self, image_base64: str) -> Dict[str, Any]:
        """
        Process an image through the full classification workflow
        
        Args:
            image_base64: Base64 encoded image data
            
        Returns:
            Dictionary containing minimal classification results (category, severity, severity_level, scale)
        """
        # Create initial state
        initial_state = GraphState(image_data=image_base64)
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)

        # Support both dict-like and BaseModel state objects
        formatted_result = None
        try:
            if hasattr(final_state, "formatted_result"):
                formatted_result = final_state.formatted_result
            elif isinstance(final_state, dict):
                formatted_result = final_state.get("formatted_result")
        except Exception:
            formatted_result = None

        # Return formatted result
        if formatted_result is not None:
            return formatted_result
        else:
            return {
                "category": "reject",
                "severity": None,
                "severity_level": None,
                "scale": None
            }
