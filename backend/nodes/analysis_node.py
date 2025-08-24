from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from models.schemas import GraphState, ImageAnalysis
import config


def analyze_image_node(state: GraphState) -> GraphState:
    """
    Node that performs detailed image analysis using OpenAI's vision model.
    
    Args:
        state: Current graph state containing image data
        
    Returns:
        Updated state with analysis results
    """
    try:
        # Initialize the OpenAI model with structured output
        llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            api_key=config.OPENAI_API_KEY,
            temperature=0.9
        ).with_structured_output(ImageAnalysis)
        
        # Create the analysis prompt
        analysis_prompt = """
        Analyze this image in detail. Provide a comprehensive analysis including:
        1. What you see in the image (detailed description)
        2. All objects, features, and elements you can detect
        3. The type of environment shown (IMPORTANT: distinguish between indoor/household vs outdoor/public spaces)
        4. Lighting conditions
        5. Image quality assessment
        6. The environmental or infrastructure issues visible
        7. Scale information about the size/extent of the issue in its category (e.g., for potholes: small crack, medium pothole, large road damage; for garbage: single item, small pile, large accumulation; for deforestation: single tree, small clearing, large forest area). This scale information will be useful for the classification node.
        
        CRITICAL: Pay special attention to whether this appears to be:
        - Indoor/household garbage (kitchen waste, home trash bins, personal living spaces)
        - vs. Outdoor/public environmental issues (street litter, illegal dumping, public waste)
        
        Indoor household garbage should be flagged as inappropriate for environmental monitoring.
        We only want to detect legitimate environmental issues in public/outdoor spaces.
        
        Be thorough and objective in your analysis. Focus on observable details
        that could be relevant for legitimate environmental or infrastructure assessment.
        """
        
        # Create message with image
        message = HumanMessage(
            content=[
                {"type": "text", "text": analysis_prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{state.image_data}"}
                }
            ]
        )
        
        # Get structured analysis
        analysis = llm.invoke([message])
        
        # Update state with analysis
        state.analysis = analysis
        
        return state
        
    except Exception as e:
        state.error = f"Error in image analysis: {str(e)}"
        return state
