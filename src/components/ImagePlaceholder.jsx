import { FaUtensils, FaConciergeBell } from 'react-icons/fa';
import styles from './ImagePlaceholder.module.css';

const ImagePlaceholder = ({ type = 'dish', className }) => {
    const Icon = type === 'category' ? FaConciergeBell : FaUtensils;

    return (
        <div className={`${styles.placeholder} ${className || ''}`}>
            <Icon className={styles.icon} />
        </div>
    );
};

export default ImagePlaceholder;
