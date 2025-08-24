from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from models.schemas import GraphState, ClassificationResult
import config


def classify_image_node(state: GraphState) -> GraphState:
    """
    Node that classifies the image based on analysis and assigns severity score.
    
    Args:
        state: Current graph state containing image data and analysis
        
    Returns:
        Updated state with classification results
    """
    try:
        if not state.analysis:
            state.error = "No analysis available for classification"
            return state
        
        # Check for household/indoor garbage first
        if state.analysis.is_indoor_household:
            # Create simple rejection classification
            state.classification = ClassificationResult(
                category="reject",
                severity=None,
                severity_level=None,
                scale=None,
                confidence=0.95,  # High confidence for rejection
                reasoning="Image identified as household/indoor garbage which is not appropriate for environmental monitoring."
            )
            return state
            
        # Initialize the OpenAI model with structured output
        llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            api_key=config.OPENAI_API_KEY,
            temperature=0.8  # Lower temperature for more consistent classifications
        ).with_structured_output(ClassificationResult)
        
        # Create the classification prompt
        classification_prompt = f"""
        Based on the detailed image analysis provided, classify this image into one of these categories:

        1. **garbage**: Images showing litter, waste, trash accumulation, illegal dumping, 
           or general pollution from solid waste materials IN PUBLIC/OUTDOOR SPACES ONLY
        2. **potholes**: Images showing road damage, holes in pavement, street deterioration, 
           or infrastructure damage to roads/sidewalks
        3. **deforestation**: Images showing cut trees, cleared forest areas, tree stumps, 
           logging activities, or forest destruction
        4. **reject**: If the image doesn't clearly fit into any of the above categories OR
           if it shows household/indoor garbage (kitchen waste, home trash, personal spaces)

        IMPORTANT REJECTION CRITERIA:
        - Indoor/household garbage (kitchen bins, home waste, personal living spaces) → REJECT
        - Private property waste that's not a public environmental issue → REJECT
        - Images that appear to be taken mischievously of personal/household items → REJECT
        
        ONLY ACCEPT images showing legitimate environmental/infrastructure issues in public spaces.

        SEVERITY ASSESSMENT:
        - Assess the severity on a scale of 0-100 based on the environmental or infrastructure impact
        - Choose a severity_level from: low, low-high, moderate, moderate-high, high, extreme
        - Provide scale information describing the size/extent of the issue (e.g., 'small pothole', 'large garbage pile', 'single tree cut', 'extensive forest clearing')
        - For "reject" category: set severity, severity_level, and scale to null
        - Use your best judgment based on what you observe in the image
        - Consider factors like scale, safety impact, environmental damage, and cleanup requirements

        IMAGE ANALYSIS:
        Description: {state.analysis.description}
        Objects detected: {', '.join(state.analysis.objects_detected)}
        Environment: {state.analysis.environment_type}
        Is Indoor/Household: {state.analysis.is_indoor_household}
        Legitimacy Assessment: {state.analysis.legitimacy_assessment}
        Potential issues: {', '.join(state.analysis.potential_issues)}

        Based on this analysis, provide your classification with detailed reasoning.
        Be conservative with category selection - only classify as garbage/potholes/deforestation if clearly evident in PUBLIC spaces.
        REJECT any household/indoor garbage or mischievous uploads.
        
        Determine appropriate severity (0-100) and severity_level based on your assessment of the actual impact shown.
        Your confidence should reflect how certain you are of both the category AND severity assessment.
        """
        
        # Create message for classification
        message = HumanMessage(content=classification_prompt)
        
        # Get structured classification
        classification = llm.invoke([message])
        
        # Validate severity logic - only ensure reject category has null severity
        if classification.category == "reject":
            classification.severity = None
            classification.severity_level = None
            classification.scale = None
            
        # Update state with classification
        state.classification = classification
        
        return state
        
    except Exception as e:
        state.error = f"Error in image classification: {str(e)}"
        return state
