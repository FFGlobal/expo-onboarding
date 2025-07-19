import { SymbolViewProps } from "expo-symbols";
import { ComponentType } from "react";
import { ImageSourcePropType, TextStyle } from "react-native";

/**
 * Props for the OnboardingView component.
 * 
 * This component creates a beautiful onboarding screen with features list,
 * app icon, and customizable styling options.
 */
export type OnboardingViewProps = {
    /** 
     * Array of features to display in the onboarding flow.
     * Each feature will be shown with an icon, title, description, and optional links.
     */
    features: OnboardingFeature[]
    
    /** 
     * The app icon to display at the top of the onboarding screen.
     * Can be a local image require() or a remote URL.
     */
    icon: ImageSourcePropType
    
    /** 
     * The name of your app to display prominently on the onboarding screen.
     */
    appName: string
    
    /** 
     * Primary color used for accents and highlights throughout the onboarding.
     * This color will be applied to system icons, buttons, and other UI elements.
     */
    tintColor: string
    
    /** 
     * Styling options for the main app title.
     * All properties are optional and will fall back to default values.
     */
    titleStyle: {
        /** Font family for the app title */
        fontFamily?: TextStyle['fontFamily']
        /** Font size for the app title */
        fontSize?: TextStyle['fontSize']
        /** Font weight for the app title */
        fontWeight?: TextStyle['fontWeight']
        /** Line height for the app title */
        lineHeight?: TextStyle['lineHeight']
        /** Text color for the app title */
        color?: TextStyle['color']
    }
    
    /** 
     * Styling options for feature titles.
     * Applied to the title of each feature in the list.
     */
    featureTitleStyle: {
        /** Font family for feature titles */
        fontFamily?: TextStyle['fontFamily']
        /** Font size for feature titles */
        fontSize?: TextStyle['fontSize']
        /** Font weight for feature titles */
        fontWeight?: TextStyle['fontWeight']
        /** Line height for feature titles */
        lineHeight?: TextStyle['lineHeight']
        /** Text color for feature titles */
        color?: TextStyle['color']
    }
    
    /** 
     * Styling options for feature descriptions.
     * Applied to the description text of each feature in the list.
     */
    featureDescriptionStyle: {
        /** Font family for feature descriptions */
        fontFamily?: TextStyle['fontFamily']
        /** Font size for feature descriptions */
        fontSize?: TextStyle['fontSize']
        /** Font weight for feature descriptions */
        fontWeight?: TextStyle['fontWeight']
        /** Line height for feature descriptions */
        lineHeight?: TextStyle['lineHeight']
        /** Text color for feature descriptions */
        color?: TextStyle['color']
    }
    
    /** 
     * Custom button component to use for any interactive elements.
     * Should be a React component that accepts standard button props.
     */
    ButtonComponent: ComponentType
}

/**
 * Represents a single feature in the onboarding flow.
 * 
 * Each feature consists of a title, description, icon, and optional links
 * that help introduce users to your app's capabilities.
 */
export type OnboardingFeature = {
    /** 
     * The main title for this feature.
     * Should be concise and descriptive of the feature's purpose.
     */
    title: string
    
    /** 
     * Detailed description explaining what this feature does.
     * Can be multiple sentences to provide context and benefits.
     */
    description: string
    
    /** 
     * SF Symbol name to display as the feature icon.
     * Uses Apple's SF Symbols system for consistent, beautiful icons.
     * @example "star.fill", "heart", "photo.on.rectangle"
     */
    systemImage: SymbolViewProps['name']
    
    /** 
     * Custom icon component for Android to use instead of SFSymbols.
     * Can be any React component.
     */
    icon?: ComponentType
    
    /** 
     * Optional array of text segments to make clickable.
     * The original text will be replaced with a link to the URL.
     */
    links?: {
        /** Display text for the link */
        sectionText: string
        /** URL or deep link destination */
        sectionUrl: string
    }[]
}